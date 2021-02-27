import React from 'react';

import chevronRightIcon from '../../../assets/chevron_right_icon.svg';
import listDotIcon from '../../../assets/list_dot_icon.svg';
import { Container } from './styles';

interface SideBarSubItemProps {
  title: string;
  path: string;
}

export const SideBarSubItem: React.FC<SideBarSubItemProps> = ({
  title,
  path
}) => {
  return (
    <Container to={path}>
      <div>
        <img src={listDotIcon} alt="list dot icon" width={6} height={6} />
        <h1>{title}</h1>
      </div>

      <img src={chevronRightIcon} alt="chevron icon" width={9} height={5} />
    </Container>
  );
};
