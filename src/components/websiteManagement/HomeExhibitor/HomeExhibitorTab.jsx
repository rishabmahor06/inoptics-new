import React, { useState } from 'react';
import { SubTabs } from '../shared/WmShared';
import HomeExhibitorMain from './HomeExhibitorMain';
import HomeExhibitorCards from './HomeExhibitorCards';

export default function HomeExhibitorTab() {
  const [sub, setSub] = useState('Main');
  return (
    <div className="space-y-4">
     <HomeExhibitorMain />
    </div>
  );
}
