//import { Suspense } from 'react';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import {
    mdiCogOutline,
    mdiRemote,
    mdiClose,
} from '@mdi/js';

import { Box, Alert, IconButton, Collapse } from '@mui/material';

import MenuItem from './MenuItem.jsx';
// import SubMenu from './SubMenu';

import { caliberArrayWithSplit } from '../../modules/format-ammo.mjs';
import categoryPages from '../../data/category-pages.json';
import useBossesData from '../../features/bosses/index.js';

import { mapIcons, useMapImagesSortedArray } from '../../features/maps/index.js';

import alertConfig from './alert-config.js';

import IntersectionObserverWrapper from './intersection-observer-wrapper.js';

import './index.css';

// automatically selects the alert color
const alertColor = alertConfig.alertColors[alertConfig.alertLevel];

const ammoTypes = caliberArrayWithSplit();

const getAmmoMenu = (setIsOpen) => {
    const ammoMenu = ammoTypes.map((ammoType) => (
        <MenuItem
            checkbox
            displayText={ammoType}
            key={`menu-item-${ammoType}`}
            prefix="/ammo"
            to={`/ammo/${ammoType}`}
            //onClick={setIsOpen.bind(this, false)}
        />
    ));
    return ammoMenu;
};

const Menu = () => {
    /*const [isOpen, setIsOpen] = useState(false);
    const handleMenuClick = () => {
        setIsOpen(!isOpen);
    };*/
    const { t } = useTranslation();
    const [open, setOpen] = useStateWithLocalStorage(alertConfig.bannerKey, true);

    const uniqueMaps = useMapImagesSortedArray();
    let mapCurrent = '';
    for (const map of uniqueMaps) {
        if (map.normalizedName !== mapCurrent) {
            map.icon = mapIcons[map.normalizedName];
            mapCurrent = map.normalizedName;
        }
        else {
            map.menuPadding = true;
        }
    }

    const { data: bosses } = useBossesData();

    return (
        <>
            {/* ALERT BANNER SECTION */}
            {alertConfig?.alertEnabled && alertConfig.alertEnabled === true && (
                <Box>
                <Collapse in={open}>
                    <Alert
                        severity={alertConfig.alertLevel}
                        variant='filled'
                        sx={{ backgroundColor: `${alertColor} !important`, borderRadius: '0px !important' }}
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setOpen(false);
                                }}
                            >
                                <Icon path={mdiClose} size={0.8} className="icon-with-text" />
                            </IconButton>
                        }
                    >
                        {t(alertConfig.text, alertConfig.textVariables)}

                        {alertConfig.linkEnabled === true && (
                            <>
                            <span>{' - '}</span>
                            <Link
                                to={alertConfig.link}
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                                {t(alertConfig.linkText)}
                            </Link>
                            </>
                        )}
                    </Alert>
                </Collapse>
            </Box>
            )}
            {/* END ALERT BANNER SECTION */}
            <nav key="main-navigation" className="navigation">
                <ul className={`menu`}>
                <IntersectionObserverWrapper>
                    <li key="menu-home" data-targetid="home" className="overflow-member">
                        <Link className="branding" to="/">
                        {/* Tarkov.dev */}
                        <img
                            alt="Tarkov.dev"
                            height={30}
                            width={186}
                            src={`${process.env.PUBLIC_URL}/tarkov-dev-logo.svg`}
                            className={'logo-padding'}
                            loading="lazy"
                        />
                    </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-maps" data-targetid="maps">
                        <Link to="/">{t('Maps')}</Link>
                        <ul style={{left: -40}}>
                            {Object.values(uniqueMaps.reduce((unique, map) => {
                                const sameMap = Object.values(unique).find(m => m.id === map.id);
                                if (!sameMap) {
                                    unique[map.id] = map;
                                    return unique;
                                }
                                if (map.projection === 'interactive') {
                                    unique[map.id] = map;
                                }
                                return unique;
                            }, {})).map((map) => (
                                <MenuItem
                                    displayText={map.name}
                                    key={`menu-item-${map.key}`}
                                    to={`/map/${map.key}`}
                                    icon={map.icon}
                                    padding={map.menuPadding}
                                    //onClick={setIsOpen.bind(this, false)}
                                />
                            ))}
                        </ul>
                    </li>
                </IntersectionObserverWrapper>
                </ul>
            </nav>
        </>
    );
};

export default Menu;
