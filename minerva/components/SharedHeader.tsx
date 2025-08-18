import React, { useState } from 'react';
import { View } from 'react-native';
import BurgerMenu from './BurgerMenu';
import UniversalSidebar from './UniversalSidebar';

interface SharedHeaderProps {
  showBurger?: boolean;
  showChatManagement?: boolean;
}

export const SharedHeader: React.FC<SharedHeaderProps> = ({ 
  showBurger = true, 
  showChatManagement = false 
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <>
      <BurgerMenu onPress={() => setSidebarVisible(true)} />
      <UniversalSidebar 
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        showChatManagement={showChatManagement}
      />
      {/* This will hide tabs when sidebar is open */}
      {sidebarVisible && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          backgroundColor: 'transparent',
          zIndex: 9998,
        }} />
      )}
    </>
  );
};

export default SharedHeader;