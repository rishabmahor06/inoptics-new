import React, { useState } from 'react';
import { SubTabs } from '../shared/WmShared';
import AboutUsSection from './AboutUsSection';
import OurVision from './OurVision';

export default function AboutUsTab() {
  const [sub, setSub] = useState('About Us');
  return (
    <div className="space-y-4">
      <SubTabs tabs={['About Us', 'Our Vision']} active={sub} onChange={setSub} />
      {sub === 'About Us'  ? <AboutUsSection /> : <OurVision />}
    </div>
  );
}
