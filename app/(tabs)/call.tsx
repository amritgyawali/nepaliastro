import React from 'react';

import { DirectoryScreen } from '@/components';
import { callAstrologers } from '@/data/astrologers';

/** Call directory tab — design/astrologer_directory_call. */
export default function CallDirectory() {
  return <DirectoryScreen mode="call" data={callAstrologers} />;
}
