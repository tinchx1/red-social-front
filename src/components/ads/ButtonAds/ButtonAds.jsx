"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import styles from "./ButtonAds.module.scss";

const ButtonAds = ({ style, hideOnDesktop = false, rounded = "none" }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/crear-anuncio");
  };

  return (
    <div className={hideOnDesktop ? styles.hideOnDesktop : ""}>
      <Button onClick={handleClick} style={style} rounded={rounded}>
        Crear Anuncio
      </Button>
    </div>
  );
};

export default ButtonAds;
