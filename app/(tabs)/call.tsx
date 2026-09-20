import React from 'react';

import { DirectoryScreen } from '@/components';
import { callAstrologers } from '@/data/astrologers';

/** Call tab: the astrologers you can speak to. */
export default function CallDirectory() {
  return <DirectoryScreen mode="call" data={callAstrologers} />;
}
