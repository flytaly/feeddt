import BigCard from '@/components/card/big-card';
import InfoNavBar from '@/components/card/info-nav-bar';

import Contacts from './contacts';

export default function ContactsPage() {
  return (
    <BigCard big>
      <div className="flex flex-col w-full h-full">
        <InfoNavBar pathname="/contacts" />
        <section className="flex-grow">
          <Contacts />
        </section>
      </div>
    </BigCard>
  );
}
