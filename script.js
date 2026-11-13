/* ------------------------------------------------
   THEME TOGGLE
------------------------------------------------ */


const themeToggle =
    document.querySelector("#theme-toggle");


const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

}


function updateThemeButton() {

    const darkMode =
        document.body.classList.contains(
            "dark-mode"
        );


    if (darkMode) {

        themeToggle.textContent =
            "DISPLAY // DARK";


        themeToggle.setAttribute(
            "aria-pressed",
            "true"
        );

    } else {

        themeToggle.textContent =
            "DISPLAY // LIGHT";


        themeToggle.setAttribute(
            "aria-pressed",
            "false"
        );

    }

}


themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark-mode"
        );


        const darkMode =
            document.body.classList.contains(
                "dark-mode"
            );


        localStorage.setItem(
            "theme",
            darkMode
                ? "dark"
                : "light"
        );


        updateThemeButton();

    }
);


updateThemeButton();



/* ------------------------------------------------
   SCROLL HUD
------------------------------------------------ */


gsap.registerPlugin(
    ScrollTrigger
);


const sectionIndicator =
    document.querySelector(
        ".section-indicator"
    );


const sectionArc =
    document.querySelector(
        ".section-arc"
    );


const sectionNumber =
    document.querySelector(
        "#section-number"
    );


const currentSectionStatus =
    document.querySelector(
        "#current-section-status"
    );


const footer =
    document.querySelector(
        "footer"
    );


const callouts =
    Array.from(
        document.querySelectorAll(
            ".wheel-callout"
        )
    );



/* ------------------------------------------------
   SECTION LANDMARKS
------------------------------------------------ */


/*
    The wheel tracks the actual visible headings.

    When a heading reaches the center of the viewport,
    its wheel callout reaches the main 45-degree point.
*/


const sections = [

    {
        section:
            document.querySelector(
                "#intro"
            ),

        marker:
            document.querySelector(
                "#intro-heading"
            ),

        name:
            "HOME"
    },

    {
        section:
            document.querySelector(
                "#about"
            ),

        marker:
            document.querySelector(
                "#about-heading"
            ),

        name:
            "ABOUT"
    },

    {
        section:
            document.querySelector(
                "#projects"
            ),

        marker:
            document.querySelector(
                "#projects-heading"
            ),

        name:
            "PROJECTS"
    },

    {
        section:
            document.querySelector(
                "#contact"
            ),

        marker:
            document.querySelector(
                "#contact-heading"
            ),

        name:
            "CONTACT"
    }

];


let sectionBoundaries = [];

let activeSectionIndex = 0;



/* ------------------------------------------------
   DOCUMENT POSITION
------------------------------------------------ */


function getDocumentTop(
    element
) {

    const rect =
        element.getBoundingClientRect();


    return (
        rect.top +
        window.scrollY
    );

}



/* ------------------------------------------------
   MEASURE SECTION LANDMARKS
------------------------------------------------ */


function measureSections() {

    sectionBoundaries =
        sections.map(
            function (
                section,
                index
            ) {

                if (index === 0) {

                    return 0;

                }


                const headingTop =
                    getDocumentTop(
                        section.marker
                    );


                const centerLine =
                    window.innerHeight *
                    0.5;


                return Math.max(
                    0,
                    headingTop -
                    centerLine
                );

            }
        );

}



/* ------------------------------------------------
   CONTINUOUS SECTION COORDINATE
------------------------------------------------ */


/*
    Wheel positions:

    HOME      = 0
    ABOUT     = 1
    PROJECTS  = 2
    CONTACT   = 3

    Values between those points are continuous.
*/


function getSectionCoordinate(
    scrollPosition
) {

    const lastIndex =
        sections.length - 1;


    if (
        scrollPosition >=
        sectionBoundaries[
            lastIndex
        ]
    ) {

        return lastIndex;

    }


    for (
        let index = 0;
        index < lastIndex;
        index++
    ) {

        const start =
            sectionBoundaries[
                index
            ];


        const end =
            sectionBoundaries[
                index + 1
            ];


        if (
            scrollPosition >= start &&
            scrollPosition < end
        ) {

            const distance =
                end - start;


            if (distance <= 0) {

                return index;

            }


            const progress =
                (
                    scrollPosition -
                    start
                ) /
                distance;


            return (
                index +
                progress
            );

        }

    }


    return 0;

}



/* ------------------------------------------------
   ACTIVE SECTION
------------------------------------------------ */


function getActiveSectionIndex(
    scrollPosition
) {

    let result = 0;


    for (
        let index = 0;
        index < sectionBoundaries.length;
        index++
    ) {

        if (
            scrollPosition >=
            sectionBoundaries[
                index
            ]
        ) {

            result =
                index;

        }

    }


    return result;

}



/* ------------------------------------------------
   SECTION INFORMATION
------------------------------------------------ */


function updateSectionInformation(
    index
) {

    if (
        index ===
        activeSectionIndex
    ) {

        return;

    }


    activeSectionIndex =
        index;


    sectionNumber.textContent =
        "//" +
        String(
            index + 1
        ).padStart(
            2,
            "0"
        );


    currentSectionStatus.textContent =
        sections[
            index
        ].name;


    callouts.forEach(
        function (
            callout,
            calloutIndex
        ) {

            callout.classList.toggle(
                "is-active",

                calloutIndex ===
                index
            );

        }
    );

}



/* ------------------------------------------------
   CALLOUT GEOMETRY
------------------------------------------------ */


const baseAngles = [
    45,
    135,
    225,
    315
];


function normalizeAngle(
    angle
) {

    return (
        (
            angle %
            360
        ) +
        360
    ) % 360;

}



/* ------------------------------------------------
   STABLE WHEEL GEOMETRY
------------------------------------------------ */


/*
    These measurements use the wheel's untransformed
    layout box.

    Rotation therefore does not change the calculated
    radius or center and the labels remain locked to
    the wheel.
*/


function getWheelGeometry() {

    const wheelWidth =
        sectionArc.offsetWidth;


    const wheelHeight =
        sectionArc.offsetHeight;


    const centerX =
        sectionArc.offsetLeft +
        (
            wheelWidth /
            2
        );


    const centerFromTop =
        sectionArc.offsetTop +
        (
            wheelHeight /
            2
        );


    const centerY =
        sectionIndicator.clientHeight -
        centerFromTop;


    const radius =
        (
            wheelWidth /
            2
        ) - 5;


    return {
        centerX,
        centerY,
        radius
    };

}



/* ------------------------------------------------
   MOVE CALLOUTS
------------------------------------------------ */


function updateCallouts(
    rotation
) {

    const geometry =
        getWheelGeometry();


    callouts.forEach(
        function (
            callout,
            index
        ) {

            const angle =
                normalizeAngle(
                    baseAngles[
                        index
                    ] +
                    rotation
                );


            /*
                Only labels on the visible part of the
                wheel are displayed.
            */

            const visible =
                angle <= 102;


            if (!visible) {

                callout.style.opacity =
                    "0";


                return;

            }


            const radians =
                angle *
                (
                    Math.PI /
                    180
                );


            const x =
                geometry.centerX +
                (
                    Math.cos(
                        radians
                    ) *
                    geometry.radius
                );


            const y =
                geometry.centerY +
                (
                    Math.sin(
                        radians
                    ) *
                    geometry.radius
                );


            /*
                Move the complete callout as one unit.

                Dot, diagonal line, horizontal line,
                and title stay physically connected.
            */

            gsap.set(
                callout,

                {
                    x:
                        x,

                    y:
                        -y,

                    force3D:
                        true
                }
            );


            /*
                Opacity only changes near the edges.

                Position is always mathematically
                attached to the circumference.
            */

            const centerDistance =
                Math.abs(
                    angle -
                    45
                );


            const visibilityStrength =
                Math.max(
                    0.2,

                    1 -
                    (
                        centerDistance /
                        60
                    )
                );


            callout.style.opacity =
                String(
                    visibilityStrength
                );

        }
    );

}



/* ------------------------------------------------
   FOOTER STOP
------------------------------------------------ */


/*
    Normally the wheel is fixed to the bottom-left
    corner of the viewport.

    Once the footer enters the viewport, the wheel
    moves upward by exactly the amount the footer
    overlaps its normal position.

    Result:

    -------------------- wheel
                         |
                         |
    ==================== footer top

    The wheel can never sit on top of the footer.
*/


function updateFooterStop() {

    if (!footer) {

        return;

    }


    const footerRect =
        footer.getBoundingClientRect();


    /*
        How far has the footer risen above
        the bottom of the viewport?
    */

    const overlap =
        Math.max(
            0,

            window.innerHeight -
            footerRect.top
        );


    /*
        Shift the ENTIRE HUD upward.

        This includes:
        - wheel
        - // section number
        - dots
        - leader lines
        - section titles

        Everything stays together.
    */

    gsap.set(
        sectionIndicator,

        {
            y:
                -overlap,

            force3D:
                true
        }
    );

}



/* ------------------------------------------------
   MAIN HUD UPDATE
------------------------------------------------ */


function updateHud(
    scrollPosition
) {

    const coordinate =
        getSectionCoordinate(
            scrollPosition
        );


    /*
        Each section landmark =
        one quarter turn.

        Downward scrolling rotates
        counter-clockwise.
    */

    const rotation =
        coordinate *
        -90;


    gsap.set(
        sectionArc,

        {
            rotation:
                rotation
        }
    );


    /*
        Titles use the exact same rotation,
        so they remain attached to the wheel.
    */

    updateCallouts(
        rotation
    );


    const activeIndex =
        getActiveSectionIndex(
            scrollPosition
        );


    updateSectionInformation(
        activeIndex
    );


    /*
        Finally position the entire wheel relative
        to the footer.
    */

    updateFooterStop();

}



/* ------------------------------------------------
   SCROLLTRIGGER
------------------------------------------------ */


ScrollTrigger.create({

    trigger:
        document.documentElement,


    start:
        0,


    end:
        function () {

            return ScrollTrigger
                .maxScroll(
                    window
                );

        },


    onUpdate:
        function (self) {

            updateHud(
                self.scroll()
            );

        }

});



/* ------------------------------------------------
   INITIALIZE
------------------------------------------------ */


function initializeHud() {

    measureSections();


    const scrollPosition =
        window.scrollY;


    activeSectionIndex =
        getActiveSectionIndex(
            scrollPosition
        );


    sectionNumber.textContent =
        "//" +
        String(
            activeSectionIndex +
            1
        ).padStart(
            2,
            "0"
        );


    currentSectionStatus.textContent =
        sections[
            activeSectionIndex
        ].name;


    callouts.forEach(
        function (
            callout,
            index
        ) {

            callout.classList.toggle(
                "is-active",

                index ===
                activeSectionIndex
            );

        }
    );


    updateHud(
        scrollPosition
    );

}



/* ------------------------------------------------
   REFRESH
------------------------------------------------ */


ScrollTrigger.addEventListener(
    "refresh",
    function () {

        measureSections();


        updateHud(
            window.scrollY
        );

    }
);


initializeHud();



window.addEventListener(
    "load",
    function () {

        ScrollTrigger.refresh();

    }
);



window.addEventListener(
    "resize",
    function () {

        measureSections();


        updateHud(
            window.scrollY
        );

    }
);