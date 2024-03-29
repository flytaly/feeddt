import BigCard from '@/components/card/big-card';
import InfoNavBar from '@/components/card/info-nav-bar';

import HelpContent from './help-content';

export default function HelpPage() {
  return (
    <BigCard big>
      <div className="flex flex-col w-full h-full">
        <InfoNavBar pathname="/help" />
        <section className="flex-grow">
          <HelpContent />
        </section>
      </div>
    </BigCard>
  );
}
