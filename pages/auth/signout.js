import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import AnimatedLoader from "../animatedloader";

function Signout({ cookies, logout_url }) {
    const cookie = new Cookies();
    const router = useRouter();
    useEffect(() => {
        if (cookies === 1) {
            router.push("/auth/signin");
        } else {
            cookie.remove("ucid", { path: "/" });
            cookie.remove("username", { path: "/" });
            window.location.href = logout_url;
        }
    }, []);

    return (
        <>
            <div className="vh-100 page">
                <AnimatedLoader />
            </div>
        </>
    );
}

export default Signout;

export async function getServerSideProps(context) {
    var SystemConfig = require("../../config/SystemConfig.json");
    var cookies = context.req.cookies["ucid"];
    var aws_cognito_user_pool_auth_url = SystemConfig.primary_info.aws_cognito_user_pool_auth_url;
    var user_url_to_redirect = SystemConfig.primary_info.user_base_url
    var aws_cognito_user_pool_client_id = SystemConfig.primary_info.aws_cognito_user_pool_client_id
    if (context.req.headers["domain-name"]) {
        if (context.req.headers["domain-name"] === "custom") {
            user_url_to_redirect = SystemConfig.primary_info.user_custom_url
        }
    }
    var logout_url = aws_cognito_user_pool_auth_url + "/logout?client_id=" + aws_cognito_user_pool_client_id + "&response_type=code&scope=openid&redirect_uri=" + user_url_to_redirect + "/auth/signin";
    console.log("logout_url", logout_url)
    console.log(cookies);
    if (cookies) {
        const res = await fetch(SystemConfig.primary_info.aws_user_api_endpoint + `/signout`, {
            method: "POST",
            body: new URLSearchParams({
                url: "signout",
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "x-ucid": cookies,
            },
        });
        const data = await res.json();
    } else {
        cookies = 1;
    }

    return {
        props: {
            cookies,
            logout_url,
        },
    };
}
