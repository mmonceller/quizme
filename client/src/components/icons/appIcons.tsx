import { createIcon } from './Icon';

const dot = (cx: number, cy: number, r = 0.9) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;

export const IconSearchEmpty = createIcon(
  'IconSearchEmpty',
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 4.5 4.5M8 10.5h5" />
  </>,
);

export const IconInbox = createIcon(
  'IconInbox',
  <>
    <path d="m3.5 13.5 2.4-7.2a1.5 1.5 0 0 1 1.4-1h9.4a1.5 1.5 0 0 1 1.4 1l2.4 7.2v4.7a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-4.7Z" />
    <path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5" />
  </>,
);

export const IconLayers = createIcon(
  'IconLayers',
  <>
    <path d="M12 4 3.5 8.5 12 13l8.5-4.5L12 4Z" />
    <path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.3 12 20.8l8.5-4.5" />
  </>,
);

export const IconPeople = createIcon(
  'IconPeople',
  <>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19c.5-3 2.8-5 5.5-5s5 2 5.5 5M15.5 5.8a3 3 0 0 1 0 5.4M17 14.3c1.8.6 3.1 2.3 3.5 4.7" />
  </>,
);

export const IconDocument = createIcon(
  'IconDocument',
  <>
    <path d="M6.5 3.5h7l4 4v12a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
    <path d="M13.5 3.5v4h4M9 12h6M9 15.5h4" />
  </>,
);

export const IconListAdd = createIcon(
  'IconListAdd',
  <path d="M4 6.5h11M4 11.5h11M4 16.5h6M17.5 14v6M14.5 17h6" />,
);

export const IconEye = createIcon(
  'IconEye',
  <>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

export const IconLock = createIcon(
  'IconLock',
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    {dot(12, 15.5, 1.1)}
  </>,
);

export const IconClock = createIcon(
  'IconClock',
  <>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 1.5M9.5 2.5h5" />
  </>,
);

export const IconCheck = createIcon('IconCheck', <path d="m5 12.5 4.5 4.5L19 7.5" />);

export const IconClose = createIcon('IconClose', <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />);

export const IconCheckCircle = createIcon(
  'IconCheckCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.3 2.8 2.8 5.2-5.6" />
  </>,
);

export const IconCrossCircle = createIcon(
  'IconCrossCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </>,
);

export const IconPartialCircle = createIcon(
  'IconPartialCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18V3Z" fill="currentColor" fillOpacity="0.25" />
  </>,
);

export const IconTrophy = createIcon(
  'IconTrophy',
  <>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 5.5H5.5v1A3 3 0 0 0 8 9.5M16 5.5h2.5v1A3 3 0 0 1 16 9.5M12 13v3.5M8.5 20h7l-.6-3.5H9.1L8.5 20Z" />
  </>,
);

export const IconSparkle = createIcon(
  'IconSparkle',
  <>
    <path d="M11 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5Z" />
    <path d="M18.5 15.5v5M16 18h5" />
  </>,
);

export const IconThumbUp = createIcon(
  'IconThumbUp',
  <>
    <path d="M8 10.5 11.2 4c1.4 0 2.5 1.1 2.5 2.5v3h4.8a1.8 1.8 0 0 1 1.8 2.1l-1.2 6.4a2 2 0 0 1-2 1.5H8v-9Z" />
    <path d="M4 10.5h4v9H4z" />
  </>,
);

export const IconTrendUp = createIcon(
  'IconTrendUp',
  <path d="m3.5 16.5 5.5-5.5 4 4 7.5-7.5M15 7.5h5.5V13" />,
);

export const IconFlag = createIcon('IconFlag', <path d="M5.5 21V4M5.5 4.5h11.5l-2 4 2 4H5.5" />);

export const IconClipboard = createIcon(
  'IconClipboard',
  <>
    <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
    <path d="M9 3h6v3H9zM8.5 11h7M8.5 14.5h7M8.5 18h4" />
  </>,
);

export const IconArrowRight = createIcon('IconArrowRight', <path d="M5 12h14M13 6l6 6-6 6" />);

export const IconUser = createIcon(
  'IconUser',
  <>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20.5c.8-4 3.8-6.5 7.5-6.5s6.7 2.5 7.5 6.5" />
  </>,
);

export const IconAlert = createIcon(
  'IconAlert',
  <>
    <path d="M10.3 4.9a2 2 0 0 1 3.4 0l7.4 12.6a2 2 0 0 1-1.7 3H4.6a2 2 0 0 1-1.7-3l7.4-12.6Z" />
    <path d="M12 10v4" />
    {dot(12, 17)}
  </>,
);
