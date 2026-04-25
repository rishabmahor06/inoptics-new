import React from 'react';
import { MdGavel } from 'react-icons/md';
import HtmlContentSection from './HtmlContentSection';

export default function RulesTab() {
  return (
    <HtmlContentSection
      title="Rules & Policy"
      icon={MdGavel}
      iconBg="#fef3c7"
      iconColor="#d97706"
      getEp="get_exhibitor_rules.php"
      addEp="add_exhibitor_rule.php"
      updateEp="update_exhibitor_rule.php"
      deleteEp="delete_exhibitor_rule.php"
    />
  );
}
