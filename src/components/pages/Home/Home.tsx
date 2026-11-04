import { Hero } from "./Hero/Hero";
import { ModuleCardsRoot } from "./ModuleCards/ModuleCardsRoot/ModuleCardsRoot";
import styles from "./styles.module.scss";

export const Home = () => {
  return (
    <main className={styles.home}>
      <Hero />
      <ModuleCardsRoot />
    </main>
  );
};
