import { emmet } from "./emmet.js";
import { PluginMain } from "./PluginClasses.js";
import { registerPlugin } from "./SmartMonkeyCore.js";
import { array2NodeList } from "./utilities.js";

const SVGs = {
  vlag: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.1287 8.50133C11.0667 8.50133 9.98733 8.198 8.846 7.878C7.66733 7.54733 6.44867 7.20467 5.20333 7.20467C4.53667 7.20467 3.58933 7.30133 3 7.49733V0.891333C3.57667 0.629333 4.52467 0.5 5.202 0.5C6.264 0.5 7.34333 0.804 8.48533 1.12533C9.664 1.45667 10.8833 1.8 12.13 1.8C12.7933 1.8 13.412 1.70333 14 1.50667V8.10933C13.4227 8.37267 12.8067 8.50133 12.1287 8.50133Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3 0.5V15.5C3 15.7761 2.77614 16 2.5 16C2.22386 16 2 15.7761 2 15.5V0.5C2 0.223858 2.22386 0 2.5 0C2.77614 0 3 0.223858 3 0.5Z" fill="currentColor"></path></svg>',
  huis: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_1678_1162)"><path d="M8.70704 0.293031C8.51951 0.105559 8.26521 0.000244141 8.00004 0.000244141C7.73488 0.000244141 7.48057 0.105559 7.29304 0.293031L0.293041 7.29303C0.110883 7.48163 0.0100885 7.73423 0.0123669 7.99643C0.0146453 8.25863 0.119814 8.50944 0.305222 8.69485C0.490631 8.88026 0.741443 8.98543 1.00364 8.9877C1.26584 8.98998 1.51844 8.88919 1.70704 8.70703L2.00004 8.41403V15C2.00004 15.2652 2.1054 15.5196 2.29293 15.7071C2.48047 15.8947 2.73482 16 3.00004 16H5.00004C5.26526 16 5.51961 15.8947 5.70715 15.7071C5.89468 15.5196 6.00004 15.2652 6.00004 15V13C6.00004 12.7348 6.1054 12.4805 6.29293 12.2929C6.48047 12.1054 6.73482 12 7.00004 12H9.00004C9.26526 12 9.51961 12.1054 9.70715 12.2929C9.89468 12.4805 10 12.7348 10 13V15C10 15.2652 10.1054 15.5196 10.2929 15.7071C10.4805 15.8947 10.7348 16 11 16H13C13.2653 16 13.5196 15.8947 13.7071 15.7071C13.8947 15.5196 14 15.2652 14 15V8.41403L14.293 8.70703C14.4816 8.88919 14.7342 8.98998 14.9964 8.9877C15.2586 8.98543 15.5095 8.88026 15.6949 8.69485C15.8803 8.50944 15.9854 8.25863 15.9877 7.99643C15.99 7.73423 15.8892 7.48163 15.707 7.29303L8.70704 0.293031Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1678_1162"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>',
  boekentas:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_1678_1159)"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.964 4V3C3.964 2.20435 4.28007 1.44129 4.84268 0.87868C5.40529 0.31607 6.16835 0 6.964 0L8.964 0C9.75965 0 10.5227 0.31607 11.0853 0.87868C11.6479 1.44129 11.964 2.20435 11.964 3V4H14C14.5304 4 15.0391 4.21071 15.4142 4.58579C15.7893 4.96086 16 5.46957 16 6V10C16 10.2652 15.8946 10.5196 15.7071 10.7071C15.5196 10.8946 15.2652 11 15 11H10C10 10.7348 9.89464 10.4804 9.70711 10.2929C9.51957 10.1054 9.26522 10 9 10H7C6.73478 10 6.48043 10.1054 6.29289 10.2929C6.10536 10.4804 6 10.7348 6 11H1C0.734784 11 0.48043 10.8946 0.292893 10.7071C0.105357 10.5196 0 10.2652 0 10V6C0 5.46957 0.210714 4.96086 0.585786 4.58579C0.960859 4.21071 1.46957 4 2 4H3.964ZM9.964 3V4H5.964V3C5.964 2.73478 6.06936 2.48043 6.25689 2.29289C6.44443 2.10536 6.69878 2 6.964 2H8.964C9.22922 2 9.48357 2.10536 9.67111 2.29289C9.85864 2.48043 9.964 2.73478 9.964 3ZM7.25 11C7.1837 11 7.12011 11.0263 7.07322 11.0732C7.02634 11.1201 7 11.1837 7 11.25V12.75C7 12.888 7.112 13 7.25 13H8.75C8.8163 13 8.87989 12.9737 8.92678 12.9268C8.97366 12.8799 9 12.8163 9 12.75V11.25C9 11.1837 8.97366 11.1201 8.92678 11.0732C8.87989 11.0263 8.8163 11 8.75 11H7.25ZM0 12H6V13C6 13.2652 6.10536 13.5196 6.29289 13.7071C6.48043 13.8946 6.73478 14 7 14H9C9.26522 14 9.51957 13.8946 9.70711 13.7071C9.89464 13.5196 10 13.2652 10 13V12H16V14C16 14.5304 15.7893 15.0391 15.4142 15.4142C15.0391 15.7893 14.5304 16 14 16H2C1.46957 16 0.960859 15.7893 0.585786 15.4142C0.210714 15.0391 0 14.5304 0 14V12Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1678_1159"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>',
  printer:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_1877_1727)"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 2V5H2C1.46957 5 0.960859 5.21071 0.585786 5.58579C0.210714 5.96086 0 6.46957 0 7V10C0 10.5304 0.210714 11.0391 0.585786 11.4142C0.960859 11.7893 1.46957 12 2 12H3V14C3 14.5304 3.21071 15.0391 3.58579 15.4142C3.96086 15.7893 4.46957 16 5 16H11C11.5304 16 12.0391 15.7893 12.4142 15.4142C12.7893 15.0391 13 14.5304 13 14V12H14C14.5304 12 15.0391 11.7893 15.4142 11.4142C15.7893 11.0391 16 10.5304 16 10V7C16 6.46957 15.7893 5.96086 15.4142 5.58579C15.0391 5.21071 14.5304 5 14 5H13V2C13 1.46957 12.7893 0.960859 12.4142 0.585786C12.0391 0.210714 11.5304 0 11 0H5C4.46957 0 3.96086 0.210714 3.58579 0.585786C3.21071 0.960859 3 1.46957 3 2ZM11 2H5V5H11V2ZM11 10H5V14H11V10Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1877_1727"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>',
  boek: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7 2.80401C5.90971 2.27317 4.71265 1.99819 3.5 2.00001C2.245 2.00001 1.057 2.29001 0 2.80401V12.804C1.0903 12.2732 2.28736 11.9982 3.5 12C5.169 12 6.718 12.51 8 13.385C9.32608 12.4802 10.8947 11.9975 12.5 12C13.755 12 14.943 12.29 16 12.804V2.80401C14.9097 2.27317 13.7126 1.99819 12.5 2.00001C11.245 2.00001 10.057 2.29001 9 2.80401V10C9 10.2652 8.89464 10.5196 8.70711 10.7071C8.51957 10.8947 8.26522 11 8 11C7.73478 11 7.48043 10.8947 7.29289 10.7071C7.10536 10.5196 7 10.2652 7 10V2.80401Z" fill="currentColor"></path></svg>',
  document:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 2C2 1.46957 2.21071 0.960859 2.58579 0.585786C2.96086 0.210714 3.46957 0 4 0H8.586C9.11639 0.000113275 9.62501 0.210901 10 0.586L13.414 4C13.7891 4.37499 13.9999 4.88361 14 5.414V14C14 14.5304 13.7893 15.0391 13.4142 15.4142C13.0391 15.7893 12.5304 16 12 16H4C3.46957 16 2.96086 15.7893 2.58579 15.4142C2.21071 15.0391 2 14.5304 2 14V2ZM4 8C4 7.73478 4.10536 7.48043 4.29289 7.29289C4.48043 7.10536 4.73478 7 5 7H11C11.2652 7 11.5196 7.10536 11.7071 7.29289C11.8946 7.48043 12 7.73478 12 8C12 8.26522 11.8946 8.51957 11.7071 8.70711C11.5196 8.89464 11.2652 9 11 9H5C4.73478 9 4.48043 8.89464 4.29289 8.70711C4.10536 8.51957 4 8.26522 4 8ZM5 11C4.73478 11 4.48043 11.1054 4.29289 11.2929C4.10536 11.4804 4 11.7348 4 12C4 12.2652 4.10536 12.5196 4.29289 12.7071C4.48043 12.8946 4.73478 13 5 13H11C11.2652 13 11.5196 12.8946 11.7071 12.7071C11.8946 12.5196 12 12.2652 12 12C12 11.7348 11.8946 11.4804 11.7071 11.2929C11.5196 11.1054 11.2652 11 11 11H5Z" fill="currentColor"></path></svg>',
  erlenmeyer:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_1877_1676)"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.00006 0C4.80231 4.22243e-05 4.60901 0.0587141 4.4446 0.168598C4.28019 0.278483 4.15205 0.434646 4.07638 0.617345C4.00071 0.800045 3.9809 1.00108 4.01947 1.19503C4.05804 1.38898 4.15325 1.56715 4.29306 1.707L5.00006 2.414V6.172C5 6.43719 4.8946 6.69151 4.70706 6.879L0.707056 10.879C-1.18294 12.769 0.156056 16 2.82806 16H13.1711C15.8441 16 17.1831 12.769 15.2931 10.879L11.2931 6.879C11.1055 6.69151 11.0001 6.43719 11.0001 6.172V2.414L11.7071 1.707C11.8469 1.56715 11.9421 1.38898 11.9806 1.19503C12.0192 1.00108 11.9994 0.800045 11.9237 0.617345C11.8481 0.434646 11.7199 0.278483 11.5555 0.168598C11.3911 0.0587141 11.1978 4.22243e-05 11.0001 0H5.00006ZM7.00006 6.172V2H9.00006V6.172C9.00049 6.96724 9.31665 7.72977 9.87906 8.292L10.9061 9.32C10.1868 9.15298 9.43544 9.18828 8.73505 9.422L8.26506 9.578C7.44393 9.85173 6.55618 9.85173 5.73506 9.578L5.17206 9.391C5.13441 9.3782 5.0964 9.36653 5.05806 9.356L6.12106 8.293C6.6837 7.73052 6.99989 6.96758 7.00006 6.172Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1877_1676"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>',
  chat: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.55113 1.39695C4.32992 1.13541 6.14943 1 8.00022 1C9.85084 1 11.6702 1.13539 13.4488 1.39689C14.9561 1.61849 16 2.93863 16 4.42138V9.0072C16 10.49 14.9561 11.8101 13.4488 12.0317C12.5756 12.1601 11.6925 12.2581 10.8007 12.3246C10.7059 12.3316 10.6233 12.3809 10.5745 12.4541L8.47546 15.6027C8.36948 15.7617 8.19106 15.8571 8 15.8571C7.80894 15.8571 7.63052 15.7617 7.52454 15.6027L5.42547 12.4541C5.37668 12.3809 5.29412 12.3316 5.1993 12.3245C4.30749 12.258 3.4244 12.16 2.55113 12.0316C1.04384 11.81 0 10.4899 0 9.00712V4.42144C0 2.9387 1.04384 1.61858 2.55113 1.39695ZM4 5.57143C4 5.25584 4.25584 5 4.57143 5H11.4286C11.7442 5 12 5.25584 12 5.57143C12 5.88702 11.7442 6.14286 11.4286 6.14286H4.57143C4.25584 6.14286 4 5.88702 4 5.57143ZM4.57143 7.28571C4.25584 7.28571 4 7.54155 4 7.85714C4 8.17273 4.25584 8.42857 4.57143 8.42857H8C8.31559 8.42857 8.57143 8.17273 8.57143 7.85714C8.57143 7.54155 8.31559 7.28571 8 7.28571H4.57143Z" fill="currentColor"></path></svg>',
  ster: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.02145 0.652812C7.38348 -0.217604 8.61652 -0.217604 8.97855 0.652812L10.6597 4.69481L15.0234 5.04464C15.9631 5.11997 16.3441 6.29266 15.6282 6.90595L12.3035 9.75387L13.3192 14.0121C13.538 14.929 12.5404 15.6538 11.7359 15.1624L8 12.8805L4.26409 15.1624C3.45958 15.6538 2.46203 14.9291 2.68077 14.0121L3.6965 9.75387L0.371845 6.90595C-0.344096 6.29267 0.0369299 5.11998 0.976619 5.04464L5.34029 4.69481L7.02145 0.652812Z" fill="currentColor"></path></svg>',
  bliksem:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_1678_1065)"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.84967 0.072344C10.0792 0.2003 10.1919 0.468286 10.1227 0.721799L8.60528 6.28572H14.1428C14.3704 6.28572 14.5762 6.42072 14.6669 6.6294C14.7576 6.83809 14.7158 7.0807 14.5606 7.24704L6.5606 15.8184C6.38131 16.0105 6.09412 16.0556 5.8646 15.9277C5.63509 15.7997 5.52242 15.5317 5.59156 15.2782L7.109 9.71428H1.57144C1.3439 9.71428 1.13804 9.57928 1.04736 9.3706C0.956671 9.16191 0.99844 8.9193 1.15369 8.75296L9.15367 0.181551C9.33297 -0.0105495 9.62016 -0.055612 9.84967 0.072344Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1678_1065"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>',
  lamp: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_1678_1129)"><path d="M9 1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V2C7 2.26522 7.10536 2.51957 7.29289 2.70711C7.48043 2.89464 7.73478 3 8 3C8.26522 3 8.51957 2.89464 8.70711 2.70711C8.89464 2.51957 9 2.26522 9 2V1ZM13.657 3.757C13.8392 3.5684 13.94 3.3158 13.9377 3.0536C13.9354 2.7914 13.8302 2.54059 13.6448 2.35518C13.4594 2.16977 13.2086 2.0646 12.9464 2.06233C12.6842 2.06005 12.4316 2.16084 12.243 2.343L11.536 3.05C11.3538 3.2386 11.253 3.4912 11.2553 3.7534C11.2576 4.0156 11.3628 4.26641 11.5482 4.45182C11.7336 4.63723 11.9844 4.7424 12.2466 4.74467C12.5088 4.74695 12.7614 4.64616 12.95 4.464L13.657 3.757ZM16 8C16 8.26522 15.8946 8.51957 15.7071 8.70711C15.5196 8.89464 15.2652 9 15 9H14C13.7348 9 13.4804 8.89464 13.2929 8.70711C13.1054 8.51957 13 8.26522 13 8C13 7.73478 13.1054 7.48043 13.2929 7.29289C13.4804 7.10536 13.7348 7 14 7H15C15.2652 7 15.5196 7.10536 15.7071 7.29289C15.8946 7.48043 16 7.73478 16 8ZM3.05 4.464C3.14225 4.55951 3.25259 4.63569 3.3746 4.6881C3.4966 4.74051 3.62782 4.7681 3.7606 4.76925C3.89338 4.7704 4.02506 4.7451 4.14795 4.69482C4.27085 4.64454 4.3825 4.57029 4.4764 4.4764C4.57029 4.3825 4.64454 4.27085 4.69482 4.14795C4.7451 4.02506 4.7704 3.89338 4.76925 3.7606C4.7681 3.62782 4.74051 3.4966 4.6881 3.3746C4.63569 3.25259 4.55951 3.14225 4.464 3.05L3.757 2.343C3.5684 2.16084 3.3158 2.06005 3.0536 2.06233C2.7914 2.0646 2.54059 2.16977 2.35518 2.35518C2.16977 2.54059 2.0646 2.7914 2.06233 3.0536C2.06005 3.3158 2.16084 3.5684 2.343 3.757L3.05 4.464ZM3 8C3 8.26522 2.89464 8.51957 2.70711 8.70711C2.51957 8.89464 2.26522 9 2 9H1C0.734784 9 0.48043 8.89464 0.292893 8.70711C0.105357 8.51957 0 8.26522 0 8C0 7.73478 0.105357 7.48043 0.292893 7.29289C0.48043 7.10536 0.734784 7 1 7H2C2.26522 7 2.51957 7.10536 2.70711 7.29289C2.89464 7.48043 3 7.73478 3 8ZM6 14V13H10V14C10 14.5304 9.78929 15.0391 9.41421 15.4142C9.03914 15.7893 8.53043 16 8 16C7.46957 16 6.96086 15.7893 6.58579 15.4142C6.21071 15.0391 6 14.5304 6 14ZM10 12C10.015 11.66 10.208 11.354 10.477 11.141C11.1297 10.6263 11.6058 9.92097 11.8391 9.12316C12.0725 8.32535 12.0515 7.47466 11.7791 6.68933C11.5067 5.904 10.9964 5.22304 10.3191 4.74112C9.64182 4.25919 8.83124 4.00022 8 4.00022C7.16876 4.00022 6.35818 4.25919 5.6809 4.74112C5.00363 5.22304 4.49332 5.904 4.22091 6.68933C3.94849 7.47466 3.9275 8.32535 4.16086 9.12316C4.39421 9.92097 4.87032 10.6263 5.523 11.141C5.793 11.354 5.985 11.66 5.999 12H10.001H10Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1678_1129"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>',
  pen: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.637,11.935C9.443,12.047 9.221,12.107 8.993,12.107C8.651,12.107 8.323,11.972 8.081,11.729L2.412,6.06L0.564,4.213C0.322,3.97 0.186,3.643 0.186,3.3C0.186,2.958 0.322,2.63 0.564,2.388L2.388,0.563C2.508,0.443 2.65,0.348 2.807,0.284C2.963,0.219 3.131,0.185 3.301,0.185C3.47,0.185 3.638,0.219 3.794,0.284C3.944,0.345 4.08,0.435 4.197,0.548L4.197,0.548L11.73,8.081C11.85,8.2 11.945,8.343 12.01,8.499C12.074,8.656 12.108,8.823 12.108,8.992C12.108,9.162 12.074,9.33 12.01,9.486C11.988,9.539 11.963,9.589 11.935,9.638L15.389,12.325L15.772,15.448L14.395,14.07C14.468,13.942 14.513,13.796 14.513,13.638C14.513,13.465 14.462,13.295 14.366,13.151C14.27,13.008 14.133,12.895 13.973,12.829C13.813,12.763 13.637,12.746 13.467,12.779C13.297,12.813 13.141,12.896 13.018,13.019C12.896,13.141 12.813,13.297 12.779,13.467C12.745,13.637 12.762,13.813 12.829,13.973C12.895,14.133 13.007,14.27 13.151,14.366C13.296,14.463 13.464,14.514 13.638,14.514C13.789,14.513 13.939,14.472 14.07,14.395L15.448,15.773L12.324,15.389L9.637,11.935Z" fill="currentColor"></path></svg>',
};
type Icoon = keyof typeof SVGs;
type Icoontjes = [
  Icoon,
  Icoon,
  Icoon,
  Icoon,
  Icoon,
  Icoon,
  Icoon,
  Icoon,
  Icoon,
  Icoon
];
const icoontjes = Object.keys(SVGs) as Icoon[];

declare global {
  namespace SmartMonkey {
    interface MainPlugins {
      [id]: typeof plugin;
    }
    interface PluginsSettings {
      [id]: Icoontjes;
    }
  }
}

// Plaatsen waar icoontje nog voorkomt:
// in aanpasscherm rechtsbovenaan
// in de todo-lijst zelf
// in de planner
// bij het openen van een bestaande todo

// soms is dit met verschillende width en height dus als de svg vergeleken wordt moet die onafhankelijk zijn van width en height. mogelijks door enkel innerHTML van svg-element te vergelijken en niet de outerHTML
// soms komt het ook voor zonder het xmlns attribuut -> reden te meer enkel naar innerHTML te kijken

const id = "planner-todo-icoontjes" as const;
const plugin = new PluginMain<typeof id>({
  id,
  version: "v0.1",
  inUseDefault: false,
  info: {
    name: "Planner: Andere to-do icoontjes",
    description: "Geeft de mogelijkheid om de to-do icoontjes te veranderen.",
    author: "Kanti Kuijk",
  },
  activate: () => {
    const href =
      window.performance.getEntriesByType("navigation")[0]?.name ??
      window.location.href;
    if (!/^https:\/\/[a-zA-Z]+\.smartschool\.be\/planner\/?/.test(href)) return;

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            console.log(node);
            if (node instanceof SVGElement) {
              // debugger;
              const isSVG = node instanceof SVGElement;
              const isButton = mutation.target instanceof HTMLButtonElement;
              const isIcon = mutation.target.classList.contains(
                "detail-todo-icon-and-color__icon"
              );
              const isSter = node.outerHTML.replaceAll("\n", "") === SVGs.ster;
              console.log(isSVG, isButton, isIcon, isSter);
              if (isSVG && isButton && isIcon && isSter) {
                node.innerHTML = SVGs.pen;
              }
            } else if (
              node instanceof HTMLDivElement &&
              node.hasAttribute("dialog")
            ) {
              // debugger;
              const iconBtnBar = node.querySelector(
                ".detail-todo-icon-and-color__icons"
              );
              if (!iconBtnBar) return;
              const ster = iconBtnBar.children[8];
              if (!ster) return;
              ster.innerHTML = SVGs.pen;
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true, // Observe direct child additions/removals
      subtree: true, // Observe all descendants
    });
  },
  settingsDefault: [
    "vlag",
    "huis",
    "printer",
    "boek",
    "document",
    "erlenmeyer",
    "chat",
    "ster",
    "bliksem",
    "lamp",
  ],
  changeSettings: async function () {
    return new Promise((resolve) => {
      const settings: Icoontjes = [...this.user.settings];
      const saveSettingsBtn = emmet<"button">`
        button.smscButton.blue{Sluiten}
        `;
      saveSettingsBtn.addEventListener("click", () => {
        settingsDialog.close();
        resolve(settings);
      });
      const maakOpties = (i: number) => {
        const opties = icoontjes
          .map(
            (icoon) =>
              `option[value=${icoon}]{${icoon}}${
                icoon === settings[i] ? "[selected]" : ""
              }`
          )
          .join("+");

        const icoonPicker = emmet<"select">`
            select#smk-icoon-${String(i)}.smk-icoon-picker
              >${opties}
          `;
        icoonPicker.addEventListener("change", () => {
          settings[i] = icoonPicker.value as Icoon;
        });
        const label = emmet<"label">`label{Icoon ${String(
          i + 1
        )}}[for=smk-icoon-${String(i)}]`;
        return emmet<"div">`div>${label}+${icoonPicker}`;
      };
      const pickers = Array(10)
        .fill(undefined)
        .map((_, i) => maakOpties(i));
      const settingsDialog = emmet<"dialog">`
            dialog#smk-settings
              >h3{Planner: Andere to-do icoontjes}
              +h4{Welke icoontjes wil je dat er gebruikt worden?}
              +${array2NodeList(pickers)}
              +em{Dit verandert enkel de icoontjes op deze computer.}
              +div.smscButtonContainer[style="margin-top:1em;"]
                >${saveSettingsBtn}
            `;
      document.body.append(settingsDialog);

      settingsDialog.showModal();
    });
  },
});

registerPlugin(plugin);
