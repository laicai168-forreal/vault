import { Outlet, Navigate, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Box, Modal, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { hideLoginModal } from "../store/auth/authSlice";
import { useEffect } from "react";
import "./ProtectedLayout.scss";


export default function ProtectedLayout() {
	const { showLoginModal } = useSelector((state: RootState) => state.auth);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// TODO: currently only do redirect to the login page, we will add a modal login so to avoid redirect for better experience.
	useEffect(() => {
		if (showLoginModal) navigate('/login');
	}, [showLoginModal])

	return (
		<div className="layout-wrapper">
			<NavBar />
			<main className="content-container p-4">
				<Outlet />
			</main>
		</div>
	);
}
