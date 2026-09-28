import { createContext, useContext } from 'react';
import { DEFAULT_DISPLAY } from '@shared/defaults';
import type { DisplaySettings, QuizSettings } from '@shared/types';

/** `fill` = the card stretches to the stage height (on sm+ screens) and choices grow to fill it. */
export type DisplayContextValue = DisplaySettings & { fill: boolean };

const DisplayContext = createContext<DisplayContextValue>({ ...DEFAULT_DISPLAY, fill: false });

export const DisplayProvider = DisplayContext.Provider;
export const useDisplay = () => useContext(DisplayContext);

/** Display settings with defaults filled in (older snapshots may not have them). */
export const resolveDisplay = (settings: QuizSettings): DisplaySettings => ({ ...DEFAULT_DISPLAY, ...settings.display });

/** Wide and full-width layouts fill the screen height too. */
export const fillsHeight = (display: DisplaySettings) => display.width !== 'standard';
