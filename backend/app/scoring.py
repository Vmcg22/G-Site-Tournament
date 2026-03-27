"""
G-SITE Scoring System

Score = Kills + Placement Points

Placement Points:
    1st  -> 10
    2nd  -> 7
    3rd  -> 5
    4th  -> 3
    5th+ -> 1
"""

PLACEMENT_POINTS = {
    1: 10,
    2: 7,
    3: 5,
    4: 3,
}

DEFAULT_POINTS = 1  # 5th and below


def calculate_placement_points(placement: int | None) -> int:
    if placement is None:
        return 0
    return PLACEMENT_POINTS.get(placement, DEFAULT_POINTS)


def calculate_score(kills: int, placement: int | None) -> int:
    return kills + calculate_placement_points(placement)
