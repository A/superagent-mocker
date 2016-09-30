0.5.2 / 2016-09-29
==================

- Treat other 20x statuses (besides 200) as success [#38](https://github.com/A/superagent-mocker/pull/38)

0.5.1 / 2016-09-29
==================

- Allow non object data to be handled in the request body via `send()` [#36](https://github.com/A/superagent-mocker/pull/36)

0.5.0 / 2016-09-21
==================

- can now handle parallel requests [#32](https://github.com/A/superagent-mocker/issues/32)
- Fix error parameter returned by mocked superagent to match the documented superagent error handling [#34](https://github.com/A/superagent-mocker/issues/34)
- Support capturing query params [#35](https://github.com/A/superagent-mocker/issues/35) 

0.4.0 / 2016-04-11
==================

- mockable status codes added
- fixed issue with sending multiple requests to single router [#28](https://github.com/A/superagent-mocker/issues/28)


0.3.0 / 2015-10-07
==================

- added `clearRoute()` to remove routes by url and http-method [#19](https://github.com/shuvalov-anton/superagent-mocker/issues/19)
- added `unmock` method to disable mocker [#19](https://github.com/shuvalov-anton/superagent-mocker/issues/19)
- fixed missed calling context [#19](https://github.com/shuvalov-anton/superagent-mocker/issues/19)


0.2.0 / 2015-10-07
==================

- added ability to set custom timeout for requests [#8](https://github.com/shuvalov-anton/superagent-mocker/issues/8)
- added a method to clear all registered handlers [#10](https://github.com/shuvalov-anton/superagent-mocker/issues/10)
- errors in mocks now throws into callbacks [#12](https://github.com/shuvalov-anton/superagent-mocker/issues/10)
- added support for headers and send method [#11](https://github.com/shuvalov-anton/superagent-mocker/issues/11)
- tests improved

0.1.6 / 2015-06-14
==================

- fix: unmocked routes now works properly
- fix: avoid patching when superagent is patched already
- add history.md

0.1.5 / 2015-05-20
==================

- fix race conditions that messed up responses

0.1.4 / 2015-05-18
==================

- update kewords and readme

0.1.3 / 2015-05-18
==================

- make mocker async

0.1.2 / 2015-05-13
==================

- fix error with route hadn't mocked

0.1.1 / 2015-05-13
==================

- fix matching
- fix docs
