import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';

type PersonalityTrait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

const themeConfigs: Record<PersonalityTrait, { colors: ThemeColors; name: string }> = {
  openness: {
    name: 'Kaşif',
    colors: {
      primary: 'oklch(0.6 0.15 280)', // Purple
      secondary: 'oklch(0.7 0.12 320)',
      accent: 'oklch(0.8 0.1 40)',
    },
  },
  conscientiousness: {
    name: 'Analitik',
    colors: {
      primary: 'oklch(0.5 0.12 240)', // Blue
      secondary: 'oklch(0.6 0.1 220)',
      accent: 'oklch(0.7 0.08 200)',
    },
  },
  neuroticism: {
    name: 'Güvenli',
    colors: {
      primary: 'oklch(0.7 0.08 160)', // Soft green
      secondary: 'oklch(0.75 0.06 180)',
      accent: 'oklch(0.8 0.05 140)',
    },
  },
  extraversion: {
    name: 'Sosyal',
    colors: {
      primary: 'oklch(0.65 0.2 30)', // Orange
      secondary: 'oklch(0.7 0.18 50)',
      accent: 'oklch(0.75 0.15 10)',
    },
  },
  agreeableness: {
    name: 'Topluluk',
    colors: {
      primary: 'oklch(0.68 0.12 120)', // Warm green
      secondary: 'oklch(0.72 0.1 100)',
      accent: 'oklch(0.76 0.08 80)',
    },
  },
};

/**
 * Hook that adapts theme based on user's personality profile
 */
export function useAdaptiveTheme() {
  const { data: profile } = trpc.personality.getProfile.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!profile || !profile.dominantTrait) return;

    const theme = themeConfigs[profile.dominantTrait];
    if (!theme) return;

    // Apply theme colors to CSS variables
    const root = document.documentElement;
    
    // Parse OKLCH and apply
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);

    // Store theme name for UI display
    root.setAttribute('data-personality-theme', theme.name);
  }, [profile]);

  return {
    profile,
    themeName: profile?.dominantTrait ? themeConfigs[profile.dominantTrait].name : 'Varsayılan',
    isLoading: !profile,
  };
}
