import React from 'react';
import { MdListAlt } from 'react-icons/md';
import HtmlContentSection from './HtmlContentSection';

export default function GuidelinesTab() {
  return (
    <HtmlContentSection
      title="Guidelines"
      icon={MdListAlt}
      iconBg="#d1fae5"
      iconColor="#059669"
      getEp="get_exhibitor_guidelines.php"
      addEp="add_exhibitor_guideline.php"
      updateEp="update_exhibitor_guideline.php"
      deleteEp="delete_exhibitor_guideline.php"
    />
  );
}
