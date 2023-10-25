==================
Evaluation Process
==================

To trigger an evaluation a POST-request has to be sent to the AS. This
can be done with curl or other tools. The request adress looks
something like this: ``https://localhost:9001/api/triggerEvaluation``.
An easy to sent this is to open the link (with the hostname of your
AS) in an internet browser and with the developer tools (ff: ctrl +
shft + i) and under ``network`` finde the GET request send by
reloading the page. Click on it and use the resend the ``Edit and
Resend`` to change GET-request to a POST request. You might need to
add an empty body ``{}`` to the request.
