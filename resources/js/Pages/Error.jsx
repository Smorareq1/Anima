import React from 'react';
import { Head } from '@inertiajs/react';
import HttpError from '../Components/HttpError';

export default function Error({status, title, message}){
    const errorProps = {
        errorCode: status || 500,
        title: title,
        message: message,
        showHomeButton: true
    };

    return (
        <>
            <Head title={`Error ${errorProps.errorCode}`} />
            <HttpError {...errorProps} />
        </>
    );
}