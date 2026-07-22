export function getCardTexture(
    color: string,
    value: string | number
): string {

    if (color === "Wild") {

        if (value === "Draw_4")
            return "/cards/Wild_Draw_4.jpg";

        return "/cards/Wild.jpg";
    }

    return `/cards/${color}_${value}.jpg`;
}