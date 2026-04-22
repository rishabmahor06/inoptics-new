import React, { useState } from 'react';
import { SubTabs } from '../shared/WmShared';
import HomePageVideo from './HomePageVideo';
import FounderSection from './FounderSection';
import PeopleComments from './PeopleComments';
import OurStory from './OurStory';
import FooterTab from './FooterTab';
import PrivacyTerms from './PrivacyTerms';
import RulesPolicy from './RulesPolicy';
import PressRelease from './PressRelease';
import MediaGallery from './MediaGallery';

const SUB_TABS = [
  'Home Video',
  'Founder Section',
  'People Comments',
  'Our Story',
  'Footer',
  'Privacy & Terms',
  'Rules & Policy',
  'Press Release',
  'Media Gallery',
];

export default function HomePage() {
  const [sub, setSub] = useState(SUB_TABS[0]);

  const renderSub = () => {
    switch (sub) {
      case 'Home Video':       return <HomePageVideo />;
      case 'Founder Section':  return <FounderSection />;
      case 'People Comments':  return <PeopleComments />;
      case 'Our Story':        return <OurStory />;
      case 'Footer':           return <FooterTab />;
      case 'Privacy & Terms':  return <PrivacyTerms />;
      case 'Rules & Policy':   return <RulesPolicy />;
      case 'Press Release':    return <PressRelease />;
      case 'Media Gallery':    return <MediaGallery />;
      default:                 return null;
    }
  };

  return (
    <div className="space-y-4">
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {renderSub()}
    </div>
  );
}
