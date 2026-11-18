import {
  CONFETTI_PIECES,
  FRIEND_SPOTS,
  MAX_FRIENDS,
  SLICE_CLIPS,
  confettiTracks,
  friendDotTracks,
  friendFlightPath,
  pickFriendSpot,
  track,
  type ConfettiPiece,
} from "@/widgets/funding/fundingResultMotion";

const piece = (shape: ConfettiPiece["shape"]): ConfettiPiece => ({
  shape,
  color: "lime",
  at: 2.5,
  x: 50,
  y: -20,
  rotate: 300,
});

describe("track", () => {
  it("[시각, 값] 쌍을 values와 0~1 times로 바꾸고, 마지막 시각을 duration으로 쓴다", () => {
    const { values, transition } = track(
      [
        [0, 0],
        [1, 5],
        [4, 10],
      ],
      "linear",
      0.3,
    );

    expect(values).toEqual([0, 5, 10]);
    expect(transition).toMatchObject({ delay: 0.3, duration: 4, times: [0, 0.25, 1] });
  });

  it("delay를 주지 않으면 0이다", () => {
    expect(
      track(
        [
          [0, 0],
          [2, 1],
        ],
        "linear",
      ).transition,
    ).toMatchObject({ delay: 0 });
  });
});

describe("pickFriendSpot", () => {
  it("8명이면 k번째 친구가 Figma k번째 자리에서 출발한다", () => {
    FRIEND_SPOTS.forEach((spot, index) => expect(pickFriendSpot(index, 8)).toBe(spot));
  });

  it("1명이면 맡은 조각(사진 전체)의 가운데 방향인 아래쪽 자리에서 출발한다", () => {
    expect(pickFriendSpot(0, 1)).toBe(FRIEND_SPOTS[4]);
  });

  it("2명이면 오른쪽·왼쪽 자리에서 출발한다", () => {
    expect([pickFriendSpot(0, 2), pickFriendSpot(1, 2)]).toEqual([
      FRIEND_SPOTS[2],
      FRIEND_SPOTS[6],
    ]);
  });
});

describe("friendFlightPath", () => {
  it("8명일 때 Figma 원본 경로와 0.1px 이내로 같다", () => {
    const { mid, end } = friendFlightPath(0, 8, FRIEND_SPOTS[0]);

    expect(end[0]).toBeCloseTo(28.233, 1);
    expect(end[1]).toBeCloseTo(44.166, 1);
    expect(mid[0]).toBeCloseTo(12.705, 1);
    expect(mid[1]).toBeCloseTo(-0.125, 1);
  });
});

describe("friendDotTracks", () => {
  const path = friendFlightPath(0, 8, FRIEND_SPOTS[0]);

  it("친구가 0.13초 간격으로 날아가기 시작한다", () => {
    expect(friendDotTracks(0, path).reveal.transition.delay).toBeCloseTo(0.9);
    expect(friendDotTracks(1, path).reveal.transition.delay).toBeCloseTo(1.03);
  });

  it("날아가기 시작하고 0.32초 뒤 사진에 닿는 순간 사라진다", () => {
    const { opacity, x } = friendDotTracks(0, path);

    expect(opacity.values).toEqual([1, 0]);
    expect(opacity.transition.delay).toBeCloseTo(1.22);
    expect(x.transition.duration).toBeCloseTo(1.22);
    expect(x.values.at(-1)).toBe(path.end[0]);
  });
});

describe("confettiTracks", () => {
  it("낙하 지점은 버스트 지점의 x×1.2, y+160이다", () => {
    const { x, y } = confettiTracks(piece("strip"));

    expect(x.values).toEqual([0, 50, 60]);
    expect(y.values).toEqual([0, -20, 140]);
    expect(x.transition.delay).toBe(2.5);
  });

  it("긴 리본(streamer)만 scaleY 트랙을 가진다", () => {
    expect(confettiTracks(piece("streamer")).scaleY?.values).toEqual([0.4, 1.2, 0.6, 1]);
    expect(confettiTracks(piece("strip")).scaleY).toBeUndefined();
    expect(confettiTracks(piece("dot")).scaleY).toBeUndefined();
  });
});

describe("데이터", () => {
  it("Figma 기준 친구 자리 8개, 컨페티 40개다", () => {
    expect(FRIEND_SPOTS).toHaveLength(MAX_FRIENDS);
    expect(CONFETTI_PIECES).toHaveLength(40);
  });

  it("인원수 N(1~8)마다 사진 조각도 N개다", () => {
    for (let count = 1; count <= MAX_FRIENDS; count += 1) {
      expect(SLICE_CLIPS[count]).toHaveLength(count);
    }
  });
});
