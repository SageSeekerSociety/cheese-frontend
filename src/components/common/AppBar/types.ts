export type AppBarLink = {
  key: string;
  title: string;
  path: string;
};

export type AppBarProps = {
  links: AppBarLink[];
};
