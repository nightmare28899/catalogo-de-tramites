import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import { NotificationContext } from "./context/NotificationContext";
import GifLoader from "./components/GifLoader";
import LayoutAuth from "./components/layouts/LayoutAuth";
import LayoutBase from "./components/layouts/LayoutBase";
import RequireSession from "./modules/tramites/components/RequireSession";

const InicioView = lazy(() => import('./views/InicioView'));
const HomeView = lazy(() => import('./views/HomeView'));

const CatalogView = lazy(() => import ('./views/users/CatalogView'));
const LoginView = lazy(() => import('./modules/tramites/views/LoginView'));
const TramitesListView = lazy(() => import('./modules/tramites/views/TramitesListView'));
const TramiteFormView = lazy(() => import('./modules/tramites/views/TramiteFormView'));
const TramiteDetailView = lazy(() => import('./modules/tramites/views/TramiteDetailView'));
const AyudaView = lazy(() => import('./modules/tramites/views/AyudaView'));
const CrudExampleView = lazy(() => import('./modules/crudExample/CrudExampleView'));

function AppContent() {
    return (
        <Suspense fallback={<GifLoader showStatus={false}/>}>
            <Routes>
                <Route path="/" element={<LayoutAuth/>}>
                    <Route index element={<HomeView/>} />
                    <Route path="login" element={<LoginView/>} />
                </Route>
                <Route element={<LayoutBase/>}>
                    <Route path="inicio" element={<InicioView />}/>
                    <Route path="informacion" element={<CatalogView />}/>
                    <Route path="ejemplo-crud" element={<CrudExampleView />}/>
                    <Route element={<RequireSession/>}>
                        <Route path="tramites" element={<TramitesListView />}/>
                        <Route path="tramites/nuevo" element={<TramiteFormView />}/>
                        <Route path="tramites/:id" element={<TramiteDetailView />}/>
                        <Route path="tramites/:id/editar" element={<TramiteFormView />}/>
                        <Route path="ayuda-maqueta" element={<AyudaView />}/>
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </Suspense>
    );
}

function App() {
    const {notification} = AntdApp.useApp();

    return (
        <NotificationContext.Provider value={notification}>
            <AppContent />
        </NotificationContext.Provider>
    );
}

export default App;
