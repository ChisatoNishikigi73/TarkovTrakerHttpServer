import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ReactComponent as GithubIcon } from '../supporter/Github.svg';
import { ReactComponent as DiscordIcon } from '../supporter/Discord.svg';
import { ReactComponent as TwitterIcon } from '../supporter/Twitter.svg';

import './index.css';
import UkraineButton from '../ukraine-button/index.js';
import OpenCollectiveButton from '../open-collective-button/index.js';

import rawVersion from '../../data/version.json';
import Contributors from '../contributors/index.js';

const version = rawVersion.version.slice(0, 7);

function Footer() {
    const { t } = useTranslation();

    return (
        <div className={'footer-wrapper'}>
            <div className="footer-section-wrapper about-section-wrapper">
                <h3>Maps</h3>
                <p>
                    <a
                        href="/map/reserve" target="_self"
                        rel="noopener noreferrer">储备站
                    </a><br />
                    <a
                        href="/map/lighthouse" target="_self"
                        rel="noopener noreferrer">灯塔
                    </a><br />
                    <a
                        href="/map/factory" target="_self"
                        rel="noopener noreferrer">工厂
                    </a><br />
                    <a
                        href="/map/shoreline" target="_self"
                        rel="noopener noreferrer">海岸线
                    </a><br />
                    <a
                        href="/map/customs" target="_self"
                        rel="noopener noreferrer">海关
                    </a><br />
                    <a
                        href="/map/interchange" target="_self"
                        rel="noopener noreferrer">立交桥
                    </a><br />
                    <a
                        href="/map/woods" target="_self"
                        rel="noopener noreferrer">森林
                    </a><br />
                    <a
                        href="/map/the-lab" target="_self"
                        rel="noopener noreferrer">实验室
                    </a><br />
                    <a
                        href="/map/streets-of-tarkov" target="_self"
                        rel="noopener noreferrer">塔科夫街区
                    </a><br />
                    <a
                        href="/map/night-factory" target="_self"
                        rel="noopener noreferrer">夜间工厂
                    </a><br />
                    <a
                        href="/map/ground-zero" target="_self"
                        rel="noopener noreferrer">中心区
                    </a><br />
                    <a
                        href="/map/openworld-2d" target="_self"
                        rel="noopener noreferrer">大世界
                    </a>
                </p>
                <h3>Map Tracker</h3>
                <Trans i18nKey={'about-open-source-p'}>
                    <p>
                    All code is available on <a
                        href="https://github.com/ChisatoNishikigi73/tarkov-dev-with-position-tracker/" target="_blank"
                        rel="noopener noreferrer"><GithubIcon /> GitHub</a>.
                    </p>
                </Trans>
            </div>
        </div>
    );
}

export default Footer;
