export const ALLOWED_EXTENSIONS = ['.pcap', '.pcapng'];

export function validatePcapFile(file) {
  if (!file)
    return 'Niciun fisier selectat.';

  const dotIndex = file.name.lastIndexOf('.');
  const ext = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : '';

  if (!ALLOWED_EXTENSIONS.includes(ext))
    return `Extensie neacceptata. Permise doar: ${ALLOWED_EXTENSIONS.join(', ')}.`;

  if (file.size === 0)
    return 'Fisierul este gol.';

  return null;
}
