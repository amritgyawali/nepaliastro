import React from 'react';

import { DirectoryScreen } from '@/components';
import { chatAstrologers } from '@/data/astrologers';

/** Chat directory tab — design/astrologer_directory_home. */
export default function ChatDirectory() {
  return <DirectoryScreen mode="chat" data={chatAstrologers} />;
}
