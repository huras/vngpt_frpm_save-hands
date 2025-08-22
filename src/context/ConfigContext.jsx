import React, {
    createContext, useCallback,
    useContext,
    useEffect,
    useState,
    // useMemo, useEffect,
  } from 'react';
import api from '../services/api';

const ConfigContext = createContext({});


export function ConfigProvider({ children }) {
    const [configs, setConfigs] = useState({});

    useEffect(() => {
      api.get('/get_configs', {
        headers: {
        //   authorization: `Bearer ${localStorage.accessToken}`,
        },
      }).then((res) => {
        const data = {
            config_ip_server:res.data.config_ip_server,
            config_numero_loja:res.data.config_numero_loja,
            config_password_bd:res.data.config_password_bd,
            config_user_bd:res.data.config_user_bd,
            impressoras:res.data.impressoras,
            cores_minutos:res.data.cores_minutos,
            padrao_tela_columns: Number.parseInt(res.data.padrao_tela_columns),
        };

        setConfigs(data)
      });
    }, []);

    return (
      <ConfigContext.Provider value={{ configs }}>
        {children}
      </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);

    if (!context) {
      throw new Error('useConfig must be used within an ConfigProvider');
    }

    return context;
}
