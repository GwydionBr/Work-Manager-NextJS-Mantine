import { Button, ButtonProps } from '@mantine/core';
import { GithubIcon } from '@mantinex/dev-icons';
import classes from './GithubButton.module.css';

export default function GithubButton(props: ButtonProps & React.ComponentPropsWithoutRef<'button'>) {
  return (
    <Button {...props} leftSection={<GithubIcon size={16} />} className={classes.githubButton} />
  );
}
