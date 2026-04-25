import React from 'react';
import { MdDescription } from 'react-icons/md';
import HtmlContentSection from './HtmlContentSection';

export default function InstructionsTab() {
  return (
    <HtmlContentSection
      title="Instructions"
      icon={MdDescription}
      iconBg="#ede9fe"
      iconColor="#6366f1"
      getEp="get_exhibitor_dashboard_instructions.php"
      addEp="add_exhibitor_dashboard_instructions.php"
      updateEp="update_exhibitor_dashboard_instructions.php"
      deleteEp="delete_exhibitor_dashboard_instructions.php"
    />
  );
}
