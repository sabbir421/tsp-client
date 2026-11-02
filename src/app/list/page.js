'use client';

import Link from 'next/link';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import ListPropertyWizard from '../components/dashboard/ListPropertyWizard';

export default function ListPropertyPage() {
  return (
    <>
      <PrototypeHeader />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <span>List a property</span>
          </div>
          <h1>List your property privately</h1>
          <p>
            For owners, authorised agents and developers anywhere in Dhaka City.
            Your exact address and mobile number stay hidden until you accept a matched buyer or tenant.
          </p>
        </div>
      </div>

      <ListPropertyWizard />

      <PrototypeFooter />
    </>
  );
}
