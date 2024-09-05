import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTrash,
  faRightFromBracket,
  faFileImage,
  faFilePen,
  faRightToBracket,
  faSpinner,
  faCirclePlus,
  faPhone,
  faLocationDot,
  faEnvelope,
  faLock,
  faUser,
  faFlask,
  faHeart as fasHeart,
  faFilePdf,
  faFileCsv
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";

library.add(
  faTrash,
  faRightFromBracket,
  faFileImage,
  faFilePen,
  faRightToBracket,
  faSpinner,
  faCirclePlus,
  faPhone,
  faLocationDot,
  faEnvelope,
  faLock,
  faUser,
  faFlask,
  fasHeart,
  farHeart,
  faFilePdf,
  faFileCsv
);

const iconHelper = () => {
  return library;
};

export default iconHelper;
