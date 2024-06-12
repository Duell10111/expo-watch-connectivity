import * as React from 'react';

import { ExpoWatchConnectivityViewProps } from './ExpoWatchConnectivity.types';

export default function ExpoWatchConnectivityView(props: ExpoWatchConnectivityViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
