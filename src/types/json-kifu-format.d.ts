// Ambient module declaration for json-kifu-format
// (package's types field points to a non-existent file)
declare module "json-kifu-format" {
  type Shogi = import("shogi.js").Shogi;
  type Kind = import("shogi.js").Kind;
  type Color = import("shogi.js/cjs/Color").default;

  interface IPlaceFormat {
    x: number;
    y: number;
  }

  interface IMoveMoveFormat {
    color: Color;
    from?: IPlaceFormat;
    to?: IPlaceFormat;
    piece: Kind;
    same?: boolean;
    promote?: boolean;
    capture?: Kind;
    relative?: string;
  }

  interface IMoveFormat {
    comments?: string[];
    move?: IMoveMoveFormat;
    special?: string;
    forks?: IMoveFormat[][];
  }

  interface IJSONKifuFormat {
    header: Record<string, string>;
    initial?: {
      preset: string;
      data?: unknown;
    };
    moves: IMoveFormat[];
  }

  class JKFPlayer {
    static parse(kifu: string, filename?: string): JKFPlayer;
    static parseKIF(kifu: string): JKFPlayer;
    static parseKI2(kifu: string): JKFPlayer;
    static parseCSA(kifu: string): JKFPlayer;
    static parseJKF(kifu: string): JKFPlayer;
    static moveToReadableKifu(mv: IMoveFormat): string;

    shogi: Shogi;
    kifu: IJSONKifuFormat;
    tesuu: number;

    forward(): boolean;
    backward(): boolean;
    goto(tesuu: number): void;
  }

  export { JKFPlayer };
  export type { IMoveFormat, IMoveMoveFormat, IJSONKifuFormat, IPlaceFormat };
}
