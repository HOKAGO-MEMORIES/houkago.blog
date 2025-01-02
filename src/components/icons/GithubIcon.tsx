import { siGithub } from 'simple-icons';

interface IconProps {
  size?: number;
  className?: string;
}

export default function GithubIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <title>{siGithub.title}</title>
      <path d={siGithub.path} />
    </svg>
  );
}