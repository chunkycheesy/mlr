import { LineChart } from '@mui/x-charts/LineChart';
import React from 'react';
import { FormSchemaPitches } from '../types/schemas/pitches-schema';
import Container from '@mui/material/Container';

type PitchesByInningProps = {
  pitches: FormSchemaPitches;
}

const colors: { [key: number]: string } = {
  1: 'red',
  2: 'orange',
  3: '#8B8000',
  4: 'green',
  5: 'blue',
  6: 'indigo',
  7: 'violet',
  8: 'gray',
  9: '#B47ADC',
  10: 'crimson',
  11: 'coral',
  12: 'khaki',
  13: 'mediumseagreen',
  14: 'aqua',
  15: 'mediumslateblue',
};

const PitchesByInning: React.FC<PitchesByInningProps> = ({ pitches }) => {
  if (pitches.length != 0) {
    let seriesArray: { data: number[]; label: string; color: string }[] = [];
    // const inningNumbers: { inning: number; pitches: number[] }[] = [];
    const pitchCount: number[] = [];
    const pitchNumbers: number[] = [];
    const swingNumbers: number[] = [];
    let currentChunk: number[] = []
    const inningPitches = []
    const innings = []
    const inningObject: { inning: number, pitches: number[] }[] = [];

    let highestCount: number = 0;

    for (let i = 0; i < pitches.length; i++) {
      pitchCount.push(i);
      pitchNumbers.push(pitches[i].pitch);
      swingNumbers.push(pitches[i].swing);

      if (currentChunk.length === 0 || pitches[i - 1].inning === pitches[i].inning) {
        currentChunk.push(pitches[i].pitch);
      } else {
        inningPitches.push(currentChunk);
        currentChunk = [pitches[i].pitch];
      }
    }

    if (currentChunk.length > 0) {
      inningPitches.push(currentChunk);
    }

    for (let i = 0; i < inningPitches.length; i++) {
      inningObject.push({ inning: i + 1, pitches: inningPitches[i] })
      innings.push(i + 1);
      highestCount = (highestCount < inningPitches[i].length ? inningPitches[i].length : highestCount)
    }

    const highestCountArray = Array.from({ length: highestCount }, (_, i) => i + 1)

    seriesArray = inningObject.map((series) => ({
      data: series.pitches,
      label: `Inn. ${series.inning.toString()}`,
      color: colors[series.inning]
    }));

    return (
      <Container sx={{
        height: { xs: '90vh', md: '50vh' },
        width: { xs: '90vw', lg: '100%' },
        maxHeight: { xs: '350px' },
        px: { xs: 0, md: 3 }
      }}>
        <LineChart
          title="Pitches by Inning"
          xAxis={[{ data: highestCountArray, label: "Pitch Number", tickInterval: highestCountArray, scaleType: 'point', min: 1, max: highestCount }
          ]}
          series={seriesArray}
          margin={{ top: 80 }}
          slotProps={{
            legend: {
              position: { vertical: 'top', horizontal: 'middle' },
              labelStyle: {
                fontSize: 14,
              },
            }
          }}
        />
      </Container>
    )
  }
  else {
    return null;
  }
};

export default PitchesByInning;