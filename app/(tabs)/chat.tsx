import React from 'react';

import { DirectoryScreen } from '@/components';
import { chatAstrologers } from '@/data/astrologers';

/** Chat tab: the astrologers you can message. */
export default function ChatDirectory() {
  return <DirectoryScreen mode="chat" data={chatAstrologers} />;
}
