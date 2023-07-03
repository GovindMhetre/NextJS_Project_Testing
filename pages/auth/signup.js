import { useRouter } from "next/router";
import React, { useEffect } from "react";
// import SplashScreen from "../../modules/core/components/SplashScreen";
import Cookies from "universal-cookie";
import { WaveSpinner } from "react-spinners-kit";
import AnimatedLoader from "../animatedloader";

function signup({ code, cookies, COGNITO_SIGNUP_URL, domain_name_header }) {
    const router = useRouter();
    const cookie = new Cookies();

    const fetchData = async () => {
        const JSONdata = JSON.stringify(
            new URLSearchParams({
                code: code,
            })
        );
        const endpoint = "/api/Signin/";
        var post_header = {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-ucid": cookie.get("ucid"),
        };
        if (domain_name_header) {
            post_header['domain-name'] = domain_name_header
        }
        const options = {
            method: "POST",
            headers: post_header,
            body: new URLSearchParams({
                code: code,
            }),
        };

        const response = await fetch(endpoint, options);
        const result = await response
            .json()
            .then((json) => {
                return json;
            })
            .catch((err) => {
                return response;
            });
        if (result.ucid) {
            const tenYearFromNow = new Date();
            tenYearFromNow.setFullYear(tenYearFromNow.getFullYear() + 10);
            cookie.set("ucid", result.ucid, { path: "/", expires: tenYearFromNow });
            // var username = result.username;
            // username = username[0].toUpperCase() + username.slice(1);
            // cookie.set("username", username, { path: "/" });
            //prev_route=prev_route.split('/')
            // router.push("/"); //router.push("/MyAccount");
            // router.push("/").then(() => router.reload());
            window.location.href = '/';
        }

        /*const res = await fetch(parameters.API_URL+'/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    code: code //'24173744-6902-4632-aa2c-b0478b54110', //router.query.code, //?code=24173744-6902-4632-aa2c-b0478b54110
                }),
            });
    
            const data = await res.json();
            // console.log('cookie data from auth- ', data);
            if (data.ucid) {
                cookie.set('ucid', data.ucid, { path: '/' });
                console.log('pushing to home')
                router.push('/Kyc');
            }*/
    };

    useEffect(() => {
        if (cookies === 1) {
            if (code) {
                fetchData();
            } else {
                console.log("else part", COGNITO_SIGNUP_URL);
                window.location.href = COGNITO_SIGNUP_URL;
            } // cookie.set('ucid', "432326d7-e75c-48d2-a593-c6eee71c1ee0", { path: '/' });
        } else {
            //alert("You are already Logged In");
            // router.push("/");
            // router.push("/").then(() => router.reload());
            window.location.href = "/";
        }
    }, []);

    return (
        // <div>
        //   {/* <h1>AUTH/SINGIN</h1> */}
        //   <SplashScreen />
        // </div>
        <div className="vh-100 page">
            <AnimatedLoader />
        </div>
    );
}

export default signup;

export const getServerSideProps = async (context) => {
    var SystemConfig = require("../../config/SystemConfig.json");
    var aws_cognito_user_pool_auth_url = SystemConfig.primary_info.aws_cognito_user_pool_auth_url;
    var user_url_to_redirect = SystemConfig.primary_info.user_base_url
    var aws_cognito_user_pool_client_id = SystemConfig.primary_info.aws_cognito_user_pool_client_id
    let domain_name_header = null;
    if (context.req.headers["domain-name"]) {
        if (context.req.headers["domain-name"] === "custom") {
            user_url_to_redirect = SystemConfig.primary_info.user_custom_url
            domain_name_header = context.req.headers["domain-name"];
        }
    }
    var COGNITO_SIGNUP_URL = aws_cognito_user_pool_auth_url + "/signup?client_id=" + aws_cognito_user_pool_client_id + "&response_type=code&scope=openid&redirect_uri=" + user_url_to_redirect + "/auth/signin";
    console.log("COGNITO_SIGNUP_URL", COGNITO_SIGNUP_URL)
    let code = null;
    code = context.query["code"] || null;
    var state_prev_url = null
    state_prev_url = context.query["state"] || null;
    var cookies = context.req.headers.cookie;
    //console.log("cookies: ", context.req);
    //var prev_route=context.req.headers.referer
    /* var state_url=''
     if(prev_route!=undefined)
     {
       prev_route=prev_route.split('/')
       if(prev_route.length>4)
       {
         state_url=prev_route[3]+'/'+prev_route[4]
       }
       else
       {
         if(prev_route[3]=='')
         {
           state_url='/'
         }
         else{
           state_url=prev_route[3]
         }
       }
     }
     COGNITO_SIGNUP_URL += "&state="+state_url+""*/
    //console.log("COGNITO_SIGNUP_URL",COGNITO_SIGNUP_URL)
    if (cookies) {
        if (cookies.includes("ucid")) {
            // cookies = cookies['ucid'];
            cookies = cookies;
        } else {
            cookies = 1;
        }
    } else {
        cookies = 1;
    }

    // Return the ID to the component
    return {
        props: {
            code,
            cookies,
            COGNITO_SIGNUP_URL,
            domain_name_header
        },
    };
};
