export default function capitalizeWords(str: string): string {
  return str
    .split(' ') // Divide el string en un array por espacios
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza la primera letra de cada palabra
    .join(' '); // Une el array en un solo string
}
