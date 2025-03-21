import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React from "react";
import { FormSchemaPitches } from "../types/schemas/pitches-schema";
import { SxProps, Theme } from "@mui/material/styles";

type SeasonsDropdownProps = {
  seasonOption: number,
  plateAppearances: FormSchemaPitches
  handleChangeSeason: (seasonOption: number) => void;
  sx?: SxProps<Theme>;
};

const SeasonsDropdown: React.FC<SeasonsDropdownProps> = ({ seasonOption, plateAppearances, handleChangeSeason, sx }) => {
  const handleDropdownChange = (e: { target: { value: string; }; }) => {
    const seasonOption = e.target.value;

    if (Number.isNaN(seasonOption)) {
      throw new Error('Invalid season.');
    }

    handleChangeSeason(Number(seasonOption));
  }

  const seasons = new Set<number>();
  if (plateAppearances) {
    for (let i = 0; i < plateAppearances.length; i++) {
      seasons.add(plateAppearances[i].season)
    }
  }

  const seasonList = [...seasons].reverse()
  const latestSeason = Number([...seasons].slice(-1));

  React.useEffect(() => {
    if (seasonOption == 0) {
      handleChangeSeason(latestSeason);
    }
  }, [handleChangeSeason, latestSeason, seasonOption]);

  return (
    <FormControl sx={{ m: 1, minWidth: { xs: 90, lg: 175 }, ...sx }}>
      <InputLabel id="season-input-select-label">Season</InputLabel>
      <Select
        labelId="season-input-select-label"
        id="season-input-select"
        onChange={handleDropdownChange}
        value={seasonOption ? seasonOption.toString() : ''

        }
      >
        {
          seasonList.map((season) => {
            return (
              <MenuItem key={season} value={(season === undefined || season === null || seasonList.length === 0) ? '' : season}>
                {season}
              </MenuItem>
            )
          })
        }
      </Select>
    </FormControl>
  )
}

export default SeasonsDropdown;