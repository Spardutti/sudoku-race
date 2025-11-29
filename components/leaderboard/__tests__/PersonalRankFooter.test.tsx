import { render, screen } from "@testing-library/react";
import { PersonalRankFooter } from "../PersonalRankFooter";
import type { PersonalRank } from "@/actions/leaderboard";

describe("PersonalRankFooter", () => {
  it("renders footer when rank is outside top 100", () => {
    const personalRank: PersonalRank = {
      rank: 150,
      completion_time_seconds: 300,
    };

    render(<PersonalRankFooter personalRank={personalRank} />);

    expect(screen.getByText(/Your rank:/i)).toBeInTheDocument();
    expect(screen.getByText(/#150/i)).toBeInTheDocument();
    expect(screen.getByText(/05:00/i)).toBeInTheDocument();
  });

  it("does not render when rank is inside top 100", () => {
    const personalRank: PersonalRank = {
      rank: 50,
      completion_time_seconds: 200,
    };

    const { container } = render(<PersonalRankFooter personalRank={personalRank} />);

    expect(container.firstChild).toBeNull();
  });

  it("does not render when rank is exactly 100", () => {
    const personalRank: PersonalRank = {
      rank: 100,
      completion_time_seconds: 250,
    };

    const { container } = render(<PersonalRankFooter personalRank={personalRank} />);

    expect(container.firstChild).toBeNull();
  });

  it("formats time correctly in footer", () => {
    const personalRank: PersonalRank = {
      rank: 200,
      completion_time_seconds: 754,
    };

    render(<PersonalRankFooter personalRank={personalRank} />);

    expect(screen.getByText(/12:34/i)).toBeInTheDocument();
  });
});
