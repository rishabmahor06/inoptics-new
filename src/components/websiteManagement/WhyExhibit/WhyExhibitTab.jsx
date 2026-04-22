import React, { useState } from 'react';
import { SubTabs } from '../shared/WmShared';
import WhyExhibitMain from './WhyExhibitMain';
import WhyExhibitImages from './WhyExhibitImages';
import WhyExhibitPDF from './WhyExhibitPDF';
import WhyExhibitBecomeExhibitor from './WhyExhibitBecomeExhibitor';

const SUB_TABS = ['Main', 'Images', 'PDFs', 'Become Exhibitor'];

export default function WhyExhibitTab() {
  const [sub, setSub] = useState('Main');
  return (
    <div className="space-y-4">
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'Main'             && <WhyExhibitMain />}
      {sub === 'Images'           && <WhyExhibitImages />}
      {sub === 'PDFs'             && <WhyExhibitPDF />}
      {sub === 'Become Exhibitor' && <WhyExhibitBecomeExhibitor />}
    </div>
  );
}
