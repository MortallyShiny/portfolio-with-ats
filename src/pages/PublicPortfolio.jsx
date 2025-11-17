import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/config";

export default function PublicPortfolio() {
  const { username } = useParams();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      const { data, error } = await supabase
        .from("user_portfolios")
        .select("html_output")
        .eq("username", username)
        .maybeSingle();

      if (data?.html_output) {
        setHtml(data.html_output);
      }

      setLoading(false);
    };

    loadPortfolio();
  }, [username]);

  if (loading)
    return (
      <div className="container py-5 text-center">
        <h3>Loading portfolio...</h3>
      </div>
    );

  if (!html)
    return (
      <div className="container py-5 text-center">
        <h3>Portfolio not found</h3>
      </div>
    );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
