import { CronJob, CronTime } from 'cron';
import { Any, getConnection, IsNull, LessThan, Raw } from 'typeorm';
import PQueue from 'p-queue';
import { Feed } from '../entities/Feed';
import { logger } from '../logger';
import { getFeedsToUpdate, updateFeedData } from './watcher-utils';
import { throttleMultiplier } from '../configs';

type WatcherProps = {
    /** Cron Time */
    cron?: string | Date | moment.Moment;
    /** Number of concurrent connections */
    concurrency?: number;
};

export default class Watcher {
    isUpdating: boolean = false;

    cron: string | Date | moment.Moment = '*/5 * * * *';

    job: CronJob;

    queue: PQueue;

    updating = false;

    constructor({ cron = '*/5 * * * *', concurrency = 2 }: WatcherProps = {}) {
        this.cron = cron;
        this.initJob();
        this.queue = new PQueue({ concurrency });
    }

    async update() {
        if (this.updating) return;
        this.updating = true;
        logger.info('Start updating...');

        const feeds = await getFeedsToUpdate();
        const now = Date.now();
        let [totalFeeds, totalItems] = [0, 0];
        await this.queue.addAll(
            feeds
                .filter((f) => now > throttleMultiplier * f.throttled + f.lastUpdAttempt.getTime())
                .map(({ url }) => async () => {
                    const [isSuccessful, itemsNum] = await updateFeedData(url);
                    if (isSuccessful) {
                        totalFeeds += 1;
                        totalItems += itemsNum;
                    }
                }),
        );
        logger.info({ totalFeeds, totalItems }, 'End updating');
        this.updating = false;
    }

    initJob() {
        const jobCallBack = async () => {
            if (this.isUpdating) return;
            this.isUpdating = true;
            try {
                await this.update();
            } catch (e) {
                logger.error({ message: e.message }, 'Error during updating');
            }
            this.isUpdating = false;
        };

        this.job = new CronJob(this.cron, jobCallBack, null, false, 'UTC');
    }

    start() {
        this.job.start();
        logger.info('Watcher is started');
    }

    cancel() {
        this.job.stop();
        logger.info('Watcher stopped');
    }

    reschedule(time: CronTime) {
        this.job.setTime(time);
    }

    getNextUpdateTime() {
        return this.job.running ? this.job.nextDates() : null;
    }
}

module.exports = Watcher;
