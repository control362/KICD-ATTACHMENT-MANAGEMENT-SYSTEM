--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.departments VALUES (1, 'ICT Department', 'ICT001');
INSERT INTO public.departments VALUES (2, 'Finance Department', 'FN001');
INSERT INTO public.departments VALUES (3, 'Media', 'MD001');
INSERT INTO public.departments VALUES (4, 'Print Department', 'PR001');
INSERT INTO public.departments VALUES (5, 'Music', 'MS01');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles VALUES (1, 'STUDENT', 'Applicant who submits and tracks an attachment application', '2026-07-08 14:47:02.446882+03');
INSERT INTO public.roles VALUES (2, 'HR_OFFICER', 'Reviewer who evaluates and decides on applications', '2026-07-08 14:47:02.446882+03');
INSERT INTO public.roles VALUES (3, 'ADMIN', 'Full system administrator: manages staff users and departments', '2026-07-08 14:47:02.446882+03');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, 'admin@kicd.ac.ke', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-14 10:14:38.217087+03', '2026-07-08 14:53:16.139491+03', '2026-07-14 10:14:38.220254+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (8, '20581310-d554-4b33-9af3-277ec7290a92', 1, 'student3@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, NULL, '2026-07-13 10:58:00.653151+03', '2026-07-13 10:58:00.653151+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (3, '2dc4dcbc-467d-446b-ba8c-9fb9a791587e', 1, 'jamesbrian@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-09 11:26:05.953582+03', '2026-07-08 15:23:06.969284+03', '2026-07-09 11:26:05.963151+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (9, '903ca56b-5715-46f1-aed3-b9539b6ef5a7', 1, 'testuploader@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-13 11:35:14.468671+03', '2026-07-13 11:25:57.942654+03', '2026-07-13 11:35:14.64444+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (10, '6b7258a1-03b0-4206-8b9a-c9e3786b823f', 1, 'testupload123@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-13 11:39:42.538285+03', '2026-07-13 11:39:42.122129+03', '2026-07-13 11:39:42.548593+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (7, '18a61a03-043c-453c-887b-beea0b0aab76', 1, 'student2@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-13 13:49:29.740983+03', '2026-07-10 22:18:18.716286+03', '2026-07-13 13:49:29.936035+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (5, 'eef24821-29b3-447c-a7bf-2fa68f62d302', 3, 'newadmin@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, NULL, '2026-07-10 22:07:02.636168+03', '2026-07-10 22:07:02.636168+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (6, 'b6358885-3d77-4c51-94e8-5e4f31076935', 2, 'hr@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-10 22:20:55.060914+03', '2026-07-10 22:17:48.386267+03', '2026-07-10 22:21:10.760971+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (11, 'f52d991c-50a0-4d4d-8107-0294c55416c8', 1, 'anthony@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-14 09:29:25.488338+03', '2026-07-13 15:16:25.564859+03', '2026-07-14 09:29:25.823803+03', false, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (2, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 2, 'hr@kicd.ac.ke', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-14 09:47:33.528237+03', '2026-07-08 14:53:16.139491+03', '2026-07-14 09:47:33.583892+03', false, NULL, 'Nancy', 'Mleo', NULL);
INSERT INTO public.users VALUES (4, 'f2fb7fef-fd94-42b5-873d-7eb499bb0b81', 1, 'student@gmail.com', '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', true, true, NULL, NULL, 0, NULL, '2026-07-14 10:01:17.409189+03', '2026-07-09 11:23:59.938147+03', '2026-07-14 10:01:17.475212+03', false, NULL, NULL, NULL, NULL);


--
-- Data for Name: applicant_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.applicant_profiles VALUES (1, '00952c59-5c19-452b-b2a8-adaf43176a29', 3, 1, '12345', 'James', 'Brian', 'jamesbrian@gmail.com', '0712121212', '2000-01-01', 'MALE', 'BSC Science Comp Science', 'UON', 3, NULL, 'Talented hardworking guy', NULL, true, '2026-07-09 11:10:28.263338+03', '2026-07-09 11:13:47.201454+03', false, NULL);
INSERT INTO public.applicant_profiles VALUES (4, '7431e04b-b0e6-40f7-a2d2-0b452b58884b', 7, 4, '323232', 'Brian', 'Broo', 'student2@gmail.com', NULL, NULL, NULL, 'BSC Communication', 'JKUAT', NULL, NULL, NULL, NULL, false, '2026-07-10 22:24:36.849323+03', '2026-07-10 23:08:30.641746+03', false, NULL);
INSERT INTO public.applicant_profiles VALUES (2, '19cabfb5-e1e5-4469-9d03-a31fcbc35041', 4, 2, '121212', 'JOHN ', 'DOE', 'student@gmail.com', NULL, NULL, NULL, 'CPA FINANCE', 'UON', NULL, NULL, NULL, NULL, false, '2026-07-09 13:13:01.670858+03', '2026-07-13 10:52:07.498157+03', false, NULL);
INSERT INTO public.applicant_profiles VALUES (6, '6deda119-45ce-41e6-a14a-56fdf20f70c0', 8, NULL, NULL, NULL, NULL, 'student3@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '2026-07-13 11:30:29.373545+03', '2026-07-13 11:30:29.373545+03', false, NULL);
INSERT INTO public.applicant_profiles VALUES (7, '8510a6ad-486a-44e5-ba1a-7c845be8e320', 11, 1, '12345643434', 'anthony', 'KIMANI', 'anthony@gmail.com', '2112121221', NULL, 'MALE', 'CS', 'CUEA', 3, 2.99, 'great guy', NULL, true, '2026-07-13 15:17:15.285988+03', '2026-07-14 09:46:19.002507+03', false, NULL);


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.opportunities VALUES (1, 'ICT INTERN', 1, 'Come help with the technical support', 'At least enrolled in campus', 2, '2026-07-09', 'PUBLISHED', '2026-07-08 15:21:07.864148+03', '2026-07-08 15:21:07.864148+03', 'OPP-2BB2D81D', 'Internship', 'None Yet', '3 Months', 'Nairobi, Kenya', 'On-site', '2026-07-08', '2026-07-15', true, NULL);
INSERT INTO public.opportunities VALUES (2, 'Accountant Intern', 2, 'We need a reliable accountant to help us with our accounts', 'Atleast reach CPA 3', 10, '2026-07-23', 'PUBLISHED', '2026-07-09 11:21:02.563202+03', '2026-07-09 11:21:02.563202+03', 'OPP-7F7DDA32', 'Internship', 'Good recommendation from our institution', '3 Months', 'Nairobi, Kenya', 'On-site', '2026-07-09', '2026-07-30', true, NULL);
INSERT INTO public.opportunities VALUES (3, 'News Anchor', 3, 'Compitent News Anchor', 'Bsc in Media Broadcasting', 1, '2026-07-31', 'PUBLISHED', '2026-07-09 14:03:34.345546+03', '2026-07-09 14:03:34.345546+03', 'OPP-AD7F6C6C', 'Internship', 'Good recommendation', '3 Months', 'Nairobi, Kenya', 'On-site', '2026-07-23', '2026-09-17', true, NULL);
INSERT INTO public.opportunities VALUES (4, 'Print Attchment', 4, 'Print Assistant', 'Bsc Printing', 1, '2026-07-23', 'PUBLISHED', '2026-07-10 22:16:49.136875+03', '2026-07-10 22:16:49.136875+03', 'OPP-0F5DA390', 'ATTACHMENT', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL);
INSERT INTO public.opportunities VALUES (5, 'Music Annalyst', 3, 'Person which good sense of judgemnt', 'Bsc in Music Arts', 5, '2026-07-22', 'PUBLISHED', '2026-07-13 10:00:31.436778+03', '2026-07-13 10:00:31.436778+03', 'OPP-9AF85965', 'INTERNSHIP', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.applications VALUES (1, 2, 1, 'APPROVED', '2026-07-09 11:29:54.814428+03', '2026-07-09 14:00:55.383198+03', 2, '2026-07-09 14:00:55.362122+03', NULL, NULL);
INSERT INTO public.applications VALUES (2, 2, 2, 'APPROVED', '2026-07-09 13:13:01.752111+03', '2026-07-10 21:29:34.730888+03', 1, '2026-07-10 21:29:34.730362+03', NULL, NULL);
INSERT INTO public.applications VALUES (5, 4, 4, 'APPROVED', '2026-07-10 22:24:52.608777+03', '2026-07-13 10:17:51.57009+03', 1, '2026-07-13 10:17:51.564536+03', '/api/documents/7_f8d1c7e7-cdbc-412e-9612-64f3b2f8bc89.pdf', '/api/documents/7_f5e208e3-8942-47db-9aea-1d19d763b13d.pdf');
INSERT INTO public.applications VALUES (18, 5, 2, 'PENDING', '2026-07-13 10:51:49.109476+03', '2026-07-13 10:52:07.551459+03', NULL, NULL, '/api/documents/4_74654cf1-ebdb-4b8b-b293-9a36034523c6.pdf', '/api/documents/4_2df3740f-170a-499a-9b0d-3721b18f4d0c.pdf');
INSERT INTO public.applications VALUES (19, 5, 6, 'DRAFT', '2026-07-13 11:30:29.425436+03', '2026-07-13 11:30:29.425436+03', NULL, NULL, NULL, NULL);
INSERT INTO public.applications VALUES (20, 4, 2, 'APPROVED', '2026-07-13 11:30:59.724565+03', '2026-07-13 11:36:09.729288+03', 2, '2026-07-13 11:36:09.726863+03', '/api/documents/4_5de9d56e-0910-4280-aaa9-8347b94365bb.pdf', '/api/documents/4_a4479eda-aaf1-44e8-b795-6efea5738c0e.pdf');
INSERT INTO public.applications VALUES (21, 3, 2, 'DRAFT', '2026-07-13 11:36:54.982486+03', '2026-07-13 11:36:54.982486+03', NULL, NULL, NULL, NULL);
INSERT INTO public.applications VALUES (23, 5, 7, 'REJECTED', '2026-07-13 15:17:15.377038+03', '2026-07-13 15:20:05.033865+03', 2, '2026-07-13 15:20:05.032852+03', '/api/documents/11_5e828a7c-b555-4dc8-91bb-404f8f1c2bab.pdf', '/api/documents/11_61dbd4aa-6c4f-4551-b9c7-1b26e6b7271a.pdf');
INSERT INTO public.applications VALUES (17, 2, 4, 'APPROVED', '2026-07-13 09:52:33.777306+03', '2026-07-14 09:24:15.585536+03', 2, '2026-07-14 09:24:15.57984+03', '/api/documents/7_845c28a4-4778-49f7-a0db-62804afb53dd.pdf', '/api/documents/7_5a778a26-baa4-4f72-9615-f7f049be3186.pdf');
INSERT INTO public.applications VALUES (24, 4, 7, 'APPROVED', '2026-07-14 09:17:24.509314+03', '2026-07-14 09:24:26.29485+03', 2, '2026-07-14 09:24:26.293612+03', '/api/documents/11_763f0e6a-9b0f-4f7a-8c19-8b108885206f.pdf', '/api/documents/11_756b5876-7e9a-44fb-8aaf-f11d11ddc264.pdf');
INSERT INTO public.applications VALUES (22, 5, 4, 'APPROVED', '2026-07-13 13:49:43.458528+03', '2026-07-14 09:24:33.4926+03', 2, '2026-07-14 09:24:33.492093+03', '/api/documents/7_a1d11567-30d8-4123-ad4b-874fbab853e9.pdf', '/api/documents/7_01ba8731-4c5e-433d-9e33-014fd172184c.pdf');
INSERT INTO public.applications VALUES (25, 3, 7, 'PENDING', '2026-07-14 09:29:51.368767+03', '2026-07-14 09:46:19.050784+03', NULL, NULL, '/api/documents/11_dfd6f922-27b6-429f-8253-9b17c2efb34c.pdf', '/api/documents/11_b867640a-f99a-49a7-a7dd-d275fa23d81e.pdf');


--
-- Data for Name: application_documents; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: opportunity_documents; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.opportunity_documents VALUES (1, 1, 'National ID/Passport', true, '2026-07-08 15:21:07.87453+03');
INSERT INTO public.opportunity_documents VALUES (2, 1, 'CV/Resume', true, '2026-07-08 15:21:07.87882+03');
INSERT INTO public.opportunity_documents VALUES (3, 1, 'Introduction Letter from Institution', true, '2026-07-08 15:21:07.881059+03');
INSERT INTO public.opportunity_documents VALUES (4, 2, 'National ID/Passport', true, '2026-07-09 11:21:02.574554+03');
INSERT INTO public.opportunity_documents VALUES (5, 2, 'CV/Resume', true, '2026-07-09 11:21:02.580319+03');
INSERT INTO public.opportunity_documents VALUES (6, 2, 'Introduction Letter from Institution', true, '2026-07-09 11:21:02.582981+03');
INSERT INTO public.opportunity_documents VALUES (7, 3, 'National ID/Passport', true, '2026-07-09 14:03:34.351456+03');
INSERT INTO public.opportunity_documents VALUES (8, 3, 'CV/Resume', true, '2026-07-09 14:03:34.351456+03');
INSERT INTO public.opportunity_documents VALUES (9, 3, 'Introduction Letter from Institution', true, '2026-07-09 14:03:34.358011+03');


--
-- Data for Name: profile_documents; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: applicant_profiles_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.applicant_profiles_student_id_seq', 7, true);


--
-- Name: application_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.application_documents_document_id_seq', 1, false);


--
-- Name: applications_application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.applications_application_id_seq', 25, true);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 5, true);


--
-- Name: opportunities_opportunity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.opportunities_opportunity_id_seq', 5, true);


--
-- Name: opportunity_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.opportunity_documents_document_id_seq', 9, true);


--
-- Name: profile_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profile_documents_document_id_seq', 1, false);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 3, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 11, true);


--
-- PostgreSQL database dump complete
--

