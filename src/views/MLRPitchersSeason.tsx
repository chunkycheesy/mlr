import * as React from 'react'
import axios from 'axios'

import { FormSchemaPitches } from '../types/schemas/pitches-schema';
import { FormSchemaPlayers } from '../types/schemas/player-schema';
import { FormSchemaTeams } from '../types/schemas/team-schema';
import teamsJson from '../utils/teams.json';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import HistogramChart from '../components/HistogramChart';
// import Slider from '@mui/material/Slider';

export default function MLRPitchers() {
  const [players, setPlayers] = React.useState<FormSchemaPlayers>([])
  const [pitchers, setPitchers] = React.useState<FormSchemaPlayers>([])
  const [pitches, setPitches] = React.useState<FormSchemaPitches>([])
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [pitcherOption, setPitcherOption] = React.useState<number>(0)

  const [teams, setTeams] = React.useState<FormSchemaTeams>([])
  const [teamOption, setTeamOption] = React.useState('')
  const [seasons, setSeasons] = React.useState<number[]>([]);
  const [seasonOption, setSeasonOption] = React.useState<number>(0)
  const [originalPitches, setOriginalPitches] = React.useState<FormSchemaPitches>([])
  const [filteredPitches, setFilteredPitches] = React.useState<FormSchemaPitches>([]);
  const [careerOption, setCareerOption] = React.useState(false);

  const theme = createTheme({
    colorSchemes: {
      dark: true,
    },
  });

  React.useEffect(() => {
    const fetchPlayerData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://api.mlr.gg/legacy/api/players')
        setPlayers(response.data);
      } catch (err) {
        setError('Error Fetching Data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  // Teams
  React.useEffect(() => {
    const teamsList = teamsJson;
    setTeams(teamsList);
  }, [teams])

  // Players
  React.useEffect(() => {
    if (players != null) {
      const pitchersList = []
      for (let i = 0; i < players.length; i++) {
        if (players[i].priPos == 'P' && players[i].Team === teamOption)
          pitchersList.push(players[i])
      }
      pitchersList.sort((a, b) => a.playerName.localeCompare(b.playerName));
      setPitchers(pitchersList)
    }
  }, [teamOption]);

  // Seasons
  React.useEffect(() => {
    if (players != null) {
      // filter the pitches based on season
      let filteredPitches: FormSchemaPitches = []
      if (!careerOption) {
        filteredPitches = originalPitches.filter(e => {
          if (e.season == seasonOption) {
            return true;
          }
        });
      }
      else {
        filteredPitches = originalPitches;
      }

      setPitches(filteredPitches);
      setFilteredPitches(filteredPitches);
    }
  }, [careerOption, originalPitches, players, seasonOption])

  async function handleChangeTeam(event: SelectChangeEvent) {
    const team = teams.find(team => team.teamID === event.target.value)
    if (team) {
      // reset dashboard
      setTeamOption(team.teamID);
      setPitcherOption(0);
      setSeasons([]);
      setSeasonOption(0);
    }
  }

  async function handleChangeSeason(event: SelectChangeEvent) {
    const season = Number(event.target.value);
    setSeasonOption(season)
  }

  async function handleChangePitcher(event: SelectChangeEvent) {
    setPitches([])
    const player = players.find(player => player.playerID === Number(event.target.value))
    if (player) {
      setPitcherOption(player.playerID)
    }

    const seasons = new Set<number>();

    try {
      const response = await axios.get(
        `https://api.mlr.gg/legacy/api/plateappearances/pitching/mlr/${event.target.value}`,
      )

      for (let i = 0; i < response.data.length; i++) {
        seasons.add(response.data[i].season)
      }

      setSeasons([...seasons].reverse())
      const latestSeason = Number([...seasons].slice(-1));
      setSeasonOption(latestSeason) // latest season first

      setOriginalPitches(response.data)

    } catch (err) {
      setError('Error Fetching Pitches' + err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCareerStatsChange(event: ChangeEvent<HTMLInputElement>, checked: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    checked ? setCareerOption(true) : setCareerOption(false);    
  }

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error &&
        <ThemeProvider theme={theme}>
          <Grid container justifyContent="center" style={{ padding: 30 }}>
            <Grid size={12}>
              <FormControl sx={{ m: 1, minWidth: 240, color: "red" }}>
                <InputLabel id="team-input-select-label">Team</InputLabel>
                <Select
                  labelId="team-input-select-label"
                  id="team-input-select"
                  label={teamOption}
                  onChange={handleChangeTeam}
                  value={teamOption}
                >
                  {
                    teams.map((team) => {
                      return (
                        <MenuItem key={team.teamID} value={team.teamID}>
                          <em>{team.teamName}</em>
                        </MenuItem>
                      )
                    })
                  }
                </Select>
                <FormHelperText>{teamOption ? '' : 'Select Team'}</FormHelperText>
              </FormControl>
              <FormControl sx={{ m: 1, minWidth: 240, color: "blue" }}>
                <InputLabel id="pitcher-input-select-label">Pitcher</InputLabel>
                <Select
                  labelId="pitcher-input-select-label"
                  id="pitcher-input-select"
                  onChange={handleChangePitcher}
                  value={pitcherOption ? pitcherOption.toString() : ''}
                >
                  {
                    pitchers.map((pitcher) => {
                      return (
                        <MenuItem key={pitcher.playerID} value={(pitcher === undefined || pitcher === null || pitchers.length === 0) ? '' : pitcher.playerID}>
                          <em>{pitcher.playerName}</em>
                        </MenuItem>
                      )
                    })
                  }
                </Select>
                <FormHelperText>{pitcherOption ? '' : 'Select Pitcher'}</FormHelperText>
              </FormControl>
              <FormControl sx={{ m: 1, minWidth: 240, color: "blue" }}>
                <InputLabel id="season-input-select-label">Season</InputLabel>
                <Select
                  labelId="season-input-select-label"
                  id="season-input-select"
                  label={seasonOption}
                  onChange={handleChangeSeason}
                  value={seasonOption ? seasonOption.toString() : ''}
                >
                  {
                    seasons.map((season) => {
                      return (
                        <MenuItem key={season} value={(season === undefined || season === null || seasons.length === 0) ? '' : season}>
                          <em>{season}</em>
                        </MenuItem>
                      )
                    })
                  }
                </Select>
                <FormHelperText>{seasonOption ? '' : 'Select Season'}</FormHelperText>
              </FormControl>
              <FormControl sx={{ m: 1, minWidth: 240, color: "blue" }}>
                
                <FormControlLabel control={<Checkbox size="small" onChange={handleCareerStatsChange} />} label="Career Stats" />
                {/* <InputLabel id="season-input-select-label">Session</InputLabel>
                <Select
                  labelId="season-input-select-label"
                  id="season-input-select"
                  label={sessionOption}
                  onChange={handleChangeSession}
                  value={sessionOption ? sessionOption.toString() : ''}
                >
                  {
                    sessions.map((session) => {
                      return (
                        <MenuItem key={session} value={(session === undefined || session === null || sessions.length === 0) ? '' : session}>
                          <em>{session}</em>
                        </MenuItem>
                      )
                    })
                  }
                </Select> */}
                {/* <FormHelperText>{sessionOption ? '' : 'Select Session'}</FormHelperText> */}
              </FormControl>
              {/* <SessionDataTable pitches={pitches} /> */}
            </Grid>

            <Grid container justifyContent="center" style={{ padding: 30 }}>
              <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }} alignItems="center" justifyContent="center">
                { /* histogram */ }
                <HistogramChart pitches={pitches} />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }} alignItems="center" justifyContent="center" >
                { /* heatmap */}
              </Grid>
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }} alignItems="center" justifyContent="center">
              <PitchByPitchDelta pitches={pitches} />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }} alignItems="center" justifyContent="center" >
                <PitchesByInning pitches={pitches} />
            </Grid> */}
          </Grid>
        </ThemeProvider>
      }
    </>
  );
}