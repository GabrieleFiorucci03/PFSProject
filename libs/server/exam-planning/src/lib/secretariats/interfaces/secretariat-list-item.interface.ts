// Forma "piatta" del segretario esposta al frontend.
// name ed email derivano dallo User collegato; la passwordHash NON viene mai esposta.
export interface SecretariatListItem {
    id: number;
    name: string;
    email: string;
}
