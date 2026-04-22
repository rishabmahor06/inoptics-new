import React from 'react';
import { useNavStore } from '../../store/useNavStore';
import BusinessRequirement from './BusinessRequirement';
import Products from './Products';
import Taxes from './Taxes';
import Currency from './Currency';
import Proforma from './Proforma';
import BadgesLimit from './BadgesLimit';
import PowerRequirement from './PowerRequirement';
import MessageRules from './MessageRules';
import ExhibitorSeriesEdit from './ExhibitorSeriesEdit';
import FurnitureRequirement from './FurnitureRequirement';

const COMPONENTS = {
  business_requirement:  BusinessRequirement,
  products:              Products,
  taxes:                 Taxes,
  currency:              Currency,
  proforma:              Proforma,
  badges_limit:          BadgesLimit,
  power_requirement:     PowerRequirement,
  message_rules:         MessageRules,
  exhibitor_series_edit: ExhibitorSeriesEdit,
  furniture_requirement: FurnitureRequirement,
};

export default function MasterLayout() {
  const masterSubTab = useNavStore(s => s.masterSubTab);
  const ActiveComp = COMPONENTS[masterSubTab] || null;
  return ActiveComp ? <ActiveComp /> : null;
}
