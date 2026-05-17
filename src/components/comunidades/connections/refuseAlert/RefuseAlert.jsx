import { Button } from "@/components/ui";
import WarningIcon from "@/assets/warning2.svg";

import styles from "./refuseAlert.module.scss";
export const RefuseAlert = ({ description, options }) => {
  return (
    <div className={styles.container}>
      <WarningIcon />
      <p>{description}</p>
      <div className={styles.containerButtons}>
        {options.map((el, index) => (
          <Button variant={el.variant} onClick={() => el.action()} key={index} style={{ width: '100%' }}>
            {el.label}
          </Button> 
        ))}
      </div>
    </div>
  );
};
