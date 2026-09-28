export const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: 'inherit', label: 'Theme default' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Quicksand', label: 'Quicksand' },
  { value: 'Fredoka', label: 'Fredoka (playful)' },
  { value: 'Baloo 2', label: 'Baloo (kids)' },
  { value: 'Comic Neue', label: 'Comic Neue' },
  { value: 'Patrick Hand', label: 'Patrick Hand (handwritten)' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Orbitron', label: 'Orbitron (futuristic)' },
  { value: 'Bebas Neue', label: 'Bebas Neue (headline)' },
  { value: 'Playfair Display', label: 'Playfair Display (elegant)' },
  { value: 'Lora', label: 'Lora (serif)' },
  { value: 'Merriweather', label: 'Merriweather (serif)' },
  { value: 'Pacifico', label: 'Pacifico (script)' },
  { value: 'Courier Prime', label: 'Courier Prime (typewriter)' },
  { value: 'Roboto Mono', label: 'Roboto Mono' },
];

export function fontStack(font: string) {
  return `'${font}', ui-sans-serif, system-ui, sans-serif`;
}
